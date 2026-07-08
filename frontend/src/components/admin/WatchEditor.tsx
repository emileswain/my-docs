import { useState } from 'react';
import type { Watch } from '../../types';

interface WatchEditorProps {
  watches: Watch[];
  onAdd: (watch: Omit<Watch, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Watch>) => void;
  onDelete: (id: string) => void;
  label?: string;
  description?: string;
}

export function WatchEditor({
  watches,
  onAdd,
  onUpdate,
  onDelete,
  label = 'Watches',
  description,
}: WatchEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', subfolder: '', pattern: '*', enabled: true, script: '' });

  const resetForm = () => {
    setForm({ name: '', subfolder: '', pattern: '*', enabled: true, script: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (watch: Watch) => {
    setForm({
      name: watch.name,
      subfolder: watch.subfolder,
      pattern: watch.pattern,
      enabled: watch.enabled,
      script: watch.script || '',
    });
    setEditingId(watch.id);
    setIsAdding(false);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const data: Record<string, unknown> = { ...form };
    if (!form.script.trim()) {
      delete data.script;
    }
    if (editingId) {
      onUpdate(editingId, data as Partial<Watch>);
    } else {
      onAdd(data as Omit<Watch, 'id'>);
    }
    resetForm();
  };

  const showForm = isAdding || editingId !== null;

  return (
    <div
      className="rounded-lg p-6"
      style={{
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-primary)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {label}
        </h3>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="px-3 py-1.5 rounded-md text-sm"
            style={{
              color: 'var(--accent-primary)',
              backgroundColor: 'var(--accent-secondary)',
            }}
          >
            <i className="fas fa-plus mr-1"></i>
            Add Watch
          </button>
        )}
      </div>
      {description && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}

      {/* Watch list */}
      {watches.length > 0 && (
        <div className="space-y-2 mb-4">
          {watches.map((watch) => (
            <div
              key={watch.id}
              className="flex items-center gap-3 px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-secondary)',
                opacity: watch.enabled ? 1 : 0.5,
              }}
            >
              <i className="fas fa-binoculars text-sm" style={{ color: 'var(--accent-primary)' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {watch.name}
                  </span>
                  {watch.source && (
                    <span
                      className="px-1.5 py-0.5 text-xs rounded"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      {watch.source}
                    </span>
                  )}
                </div>
                <code className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {watch.subfolder || '/'} &rarr; {watch.pattern}
                  {watch.script && <i className="fas fa-terminal ml-2" title="Has script" />}
                </code>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onUpdate(watch.id, { enabled: !watch.enabled })}
                  className="p-1.5 rounded"
                  style={{ color: watch.enabled ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
                  title={watch.enabled ? 'Disable' : 'Enable'}
                >
                  <i className={`fas fa-${watch.enabled ? 'eye' : 'eye-slash'} text-sm`} />
                </button>
                <button
                  onClick={() => startEdit(watch)}
                  className="p-1.5 rounded"
                  style={{ color: 'var(--text-secondary)' }}
                  title="Edit"
                >
                  <i className="fas fa-edit text-sm" />
                </button>
                <button
                  onClick={() => onDelete(watch.id)}
                  className="p-1.5 rounded"
                  style={{ color: 'var(--color-red-600)' }}
                  title="Delete"
                >
                  <i className="fas fa-trash text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {watches.length === 0 && !showForm && (
        <p className="text-sm italic" style={{ color: 'var(--text-tertiary)' }}>
          No watches configured.
        </p>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div
          className="rounded-md p-4 space-y-3"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            {editingId ? 'Edit Watch' : 'New Watch'}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Feature Branch Files"
                className="w-full px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1"
                style={{
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Subfolder</label>
              <input
                type="text"
                value={form.subfolder}
                onChange={(e) => setForm({ ...form, subfolder: e.target.value })}
                placeholder="e.g., docs/workflow/features"
                className="w-full px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1"
                style={{
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              File Pattern (glob)
            </label>
            <input
              type="text"
              value={form.pattern}
              onChange={(e) => setForm({ ...form, pattern: e.target.value })}
              placeholder="e.g., 277* or *.md"
              className="w-full px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-1"
              style={{
                border: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Uses glob syntax: * matches anything, ? matches single char. E.g., 277* matches all files starting with "277".
            </p>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              Script (optional)
            </label>
            <input
              type="text"
              value={form.script}
              onChange={(e) => setForm({ ...form, script: e.target.value })}
              placeholder="e.g., git branch --show-current | grep -oP '\\d+' | head -1"
              className="w-full px-2 py-1.5 rounded text-sm font-mono focus:outline-none focus:ring-1"
              style={{
                border: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Shell command run in the project directory. Its stdout replaces the pattern. Use the refresh button in the file tree to re-run.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              id="watch-enabled"
            />
            <label htmlFor="watch-enabled" className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Enabled by default
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={resetForm}
              className="px-3 py-1.5 rounded text-sm"
              style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim()}
              className="px-3 py-1.5 rounded text-sm"
              style={{
                backgroundColor: form.name.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: form.name.trim() ? 'white' : 'var(--text-tertiary)',
              }}
            >
              {editingId ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
