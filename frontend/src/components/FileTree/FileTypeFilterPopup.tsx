import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useFileFilterStore } from '../../store/useFileFilterStore';

interface FileTypeFilterPopupProps {
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

const POPUP_WIDTH = 760;

/**
 * Floating popup (portaled to <body>, so it sits above everything and isn't
 * clipped by the left panel) for enabling/disabling which file types show in
 * the tree. Groups come from the Rust backend; a Custom column lets the user
 * add their own types.
 */
export function FileTypeFilterPopup({ anchorRef, onClose }: FileTypeFilterPopupProps) {
  const groups = useFileFilterStore((s) => s.groups);
  const disabled = useFileFilterStore((s) => s.disabled);
  const custom = useFileFilterStore((s) => s.custom);
  const loadGroups = useFileFilterStore((s) => s.loadGroups);
  const toggleType = useFileFilterStore((s) => s.toggleType);
  const setGroup = useFileFilterStore((s) => s.setGroup);
  const addCustom = useFileFilterStore((s) => s.addCustom);
  const removeCustom = useFileFilterStore((s) => s.removeCustom);
  const resetAll = useFileFilterStore((s) => s.resetAll);

  const [newType, setNewType] = useState('');
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Position under the funnel button, clamped to the viewport.
  useLayoutEffect(() => {
    const place = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const vw = window.innerWidth;
      const width = Math.min(POPUP_WIDTH, vw - 32);
      const left = Math.max(16, Math.min(rect.left, vw - width - 16));
      setPos({ top: rect.bottom + 8, left, width });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [anchorRef]);

  const isEnabled = (ext: string) => !disabled.includes(ext);

  const Checkbox = ({ ext }: { ext: string }) => (
    <label className="flex items-center gap-2 py-0.5 cursor-pointer text-xs">
      <input
        type="checkbox"
        checked={isEnabled(ext)}
        onChange={() => toggleType(ext)}
        style={{ accentColor: 'var(--accent-primary)' }}
      />
      <span style={{ color: 'var(--text-primary)' }}>{ext}</span>
    </label>
  );

  const columns = [
    ...groups.map((g) => ({ label: g.label, types: g.types, custom: false })),
    { label: 'Custom', types: custom, custom: true },
  ];

  const popup = (
    <>
      {/* Click-away backdrop */}
      <div className="fixed inset-0" style={{ zIndex: 1000 }} onClick={onClose} />

      <div
        className="fixed rounded-xl"
        style={{
          top: pos?.top ?? -9999,
          left: pos?.left ?? -9999,
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
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderBottom: '1px solid var(--border-secondary)',
          }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Filter file types
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={resetAll}
              className="text-xs px-2 py-0.5 rounded"
              style={{ color: 'var(--text-tertiary)' }}
              title="Show all file types"
            >
              Reset
            </button>
            <button onClick={onClose} className="p-1" style={{ color: 'var(--text-tertiary)' }} title="Close">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Columns of grouped checkboxes, spaced across the width */}
        <div className="p-4 flex flex-wrap gap-6 justify-between">
          {columns.map((col) => {
            const allEnabled = col.types.length > 0 && col.types.every((t) => isEnabled(t));
            return (
              <div key={col.label} style={{ flex: '1 1 120px', minWidth: '120px' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {col.label}
                  </span>
                  {!col.custom && col.types.length > 0 && (
                    <button
                      onClick={() => setGroup(col.types, !allEnabled)}
                      className="p-0.5"
                      style={{ color: allEnabled ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
                      title={allEnabled ? 'Hide all in group' : 'Show all in group'}
                    >
                      {allEnabled ? (
                        // eye-off (click to hide the group)
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        // eye (click to show the group)
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>

                {col.types.map((ext) =>
                  col.custom ? (
                    <div key={ext} className="flex items-center gap-1 group">
                      <div className="flex-1">
                        <Checkbox ext={ext} />
                      </div>
                      <button
                        onClick={() => removeCustom(ext)}
                        className="opacity-0 group-hover:opacity-70 p-0.5"
                        style={{ color: 'var(--text-tertiary)' }}
                        title="Remove custom type"
                      >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <Checkbox key={ext} ext={ext} />
                  )
                )}

                {col.custom && (
                  <form
                    className="mt-1.5 flex items-center gap-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      addCustom(newType);
                      setNewType('');
                    }}
                  >
                    <input
                      type="text"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      placeholder=".ext"
                      className="w-16 px-1.5 py-0.5 text-xs rounded focus:outline-none"
                      style={{
                        border: '1px solid var(--border-secondary)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <button
                      type="submit"
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      Add
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  return createPortal(popup, document.body);
}
