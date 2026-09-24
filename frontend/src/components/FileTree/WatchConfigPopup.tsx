import { useEffect, useLayoutEffect, useState, useCallback, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { settingsService } from '../../services/settingsService';
import type { Watch } from '../../types';

interface WatchConfigPopupProps {
  projectId: string;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onChange: () => void; // refresh the WatchedFiles panel
}

const POPUP_WIDTH = 520;

/** Default script: the current git branch's ticket number as a glob (e.g. 277*). */
const DEFAULT_SCRIPT =
  'echo "$(git rev-parse --abbrev-ref HEAD 2>/dev/null | grep -oE \'[0-9]+\' | head -1)*"';

/**
 * Floating per-project watch configuration (portaled to <body>, opens upward
 * from the bottom bar). Lists the project's watches with inline editing, a
 * "run script" button on the pattern (branch tick number), add and delete.
 */
export function WatchConfigPopup({ projectId, anchorRef, onClose, onChange }: WatchConfigPopupProps) {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pos, setPos] = useState<{ left: number; bottom: number; width: number } | null>(null);

  const load = useCallback(async () => {
    try {
      setWatches(await settingsService.listProjectWatches(projectId));
    } catch (e) {
      console.error('Failed to load watches:', e);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  // Position above the bottom-bar button, clamped to the viewport.
  useLayoutEffect(() => {
    const place = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const vw = window.innerWidth;
      const width = Math.min(POPUP_WIDTH, vw - 32);
      const left = Math.max(16, Math.min(rect.left, vw - width - 16));
      setPos({ left, bottom: window.innerHeight - rect.top + 8, width });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [anchorRef]);

  // Local edit + commit to the backend on blur.
  const setLocal = (id: string, field: keyof Watch, value: string | boolean) =>
    setWatches((ws) => ws.map((w) => (w.id === id ? { ...w, [field]: value } : w)));

  const commit = async (id: string, updates: Partial<Watch>) => {
    try {
      await settingsService.updateProjectWatch(projectId, id, updates);
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save watch');
    }
  };

  const addWatch = async () => {
    try {
      const watch = await settingsService.addProjectWatch(projectId, {
        name: 'New watch',
        subfolder: '',
        pattern: '*',
        enabled: true,
        script: DEFAULT_SCRIPT,
      });
      setWatches((ws) => [...ws, watch]);
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add watch');
    }
  };

  const removeWatch = async (id: string) => {
    try {
      await settingsService.deleteProjectWatch(projectId, id);
      setWatches((ws) => ws.filter((w) => w.id !== id));
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete watch');
    }
  };

  const runScript = async (id: string) => {
    setRunningId(id);
    setError(null);
    try {
      const result = await settingsService.refreshWatchScript(projectId, id);
      setWatches((ws) => ws.map((w) => (w.id === id ? { ...w, ...result } : w)));
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Script failed');
    } finally {
      setRunningId(null);
    }
  };

  const inputStyle = {
    border: '1px solid var(--border-secondary)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  };

  const popup = (
    <>
      <div className="fixed inset-0" style={{ zIndex: 1000 }} onClick={onClose} />
      <div
        className="fixed rounded-xl"
        style={{
          left: pos?.left ?? -9999,
          bottom: pos?.bottom ?? 0,
          width: pos?.width ?? POPUP_WIDTH,
          maxHeight: '70vh',
          overflowY: 'auto',
          zIndex: 1001,
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
          visibility: pos ? 'visible' : 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-2.5 sticky top-0"
          style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-secondary)' }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Watched files — this project
          </span>
          <div className="flex items-center gap-2">
            <button onClick={addWatch} className="text-xs px-2 py-0.5 rounded" style={{ color: 'var(--accent-primary)' }}>
              <i className="fas fa-plus mr-1" />Add
            </button>
            <button onClick={onClose} className="p-1" style={{ color: 'var(--text-tertiary)' }} title="Close">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-3 space-y-3">
          {error && (
            <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--accent-secondary)', color: 'var(--color-red-600, #dc2626)' }}>
              {error}
            </div>
          )}

          {watches.length === 0 && (
            <p className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>
              No watches yet. Add one to list files matching a pattern by last change.
            </p>
          )}

          {watches.map((w) => (
            <div
              key={w.id}
              className="rounded-lg p-3 space-y-2"
              style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-secondary)', opacity: w.enabled ? 1 : 0.55 }}
            >
              <div className="flex items-center gap-2">
                <input
                  value={w.name}
                  onChange={(e) => setLocal(w.id, 'name', e.target.value)}
                  onBlur={() => commit(w.id, { name: w.name })}
                  placeholder="Name"
                  className="flex-1 px-2 py-1 text-xs rounded focus:outline-none"
                  style={inputStyle}
                />
                <button
                  onClick={() => commit(w.id, { enabled: !w.enabled }).then(() => setLocal(w.id, 'enabled', !w.enabled))}
                  className="p-1"
                  style={{ color: w.enabled ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
                  title={w.enabled ? 'Enabled' : 'Disabled'}
                >
                  <i className={`fas fa-${w.enabled ? 'eye' : 'eye-slash'} text-xs`} />
                </button>
                <button onClick={() => removeWatch(w.id)} className="p-1" style={{ color: 'var(--text-tertiary)' }} title="Delete">
                  <i className="fas fa-trash text-xs" />
                </button>
              </div>

              <input
                value={w.subfolder}
                onChange={(e) => setLocal(w.id, 'subfolder', e.target.value)}
                onBlur={() => commit(w.id, { subfolder: w.subfolder })}
                placeholder="Subfolder (e.g. docs/features)"
                className="w-full px-2 py-1 text-xs rounded focus:outline-none"
                style={inputStyle}
              />

              {/* Pattern (blob) + run-script button */}
              <div className="flex items-center gap-1">
                <input
                  value={w.pattern}
                  onChange={(e) => setLocal(w.id, 'pattern', e.target.value)}
                  onBlur={() => commit(w.id, { pattern: w.pattern })}
                  placeholder="Pattern (e.g. 277* or *.md)"
                  className="flex-1 px-2 py-1 text-xs font-mono rounded focus:outline-none"
                  style={inputStyle}
                />
                <button
                  onClick={() => runScript(w.id)}
                  disabled={runningId === w.id}
                  className="px-2 py-1 text-xs rounded flex items-center gap-1"
                  style={{ color: 'var(--accent-primary)', backgroundColor: 'var(--accent-secondary)' }}
                  title="Run script to set the pattern from the current branch"
                >
                  <i className={`fas fa-${runningId === w.id ? 'spinner fa-spin' : 'terminal'} text-xs`} />
                  Branch #
                </button>
              </div>

              {/* Script */}
              <input
                value={w.script || ''}
                onChange={(e) => setLocal(w.id, 'script', e.target.value)}
                onBlur={() => commit(w.id, { script: w.script || '' })}
                placeholder="Script (stdout sets the pattern)"
                className="w-full px-2 py-1 text-xs font-mono rounded focus:outline-none"
                style={{ ...inputStyle, color: 'var(--text-secondary)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return createPortal(popup, document.body);
}
