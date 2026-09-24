import { useEffect, useState } from 'react';
import { useFileFilterStore } from '../../store/useFileFilterStore';

interface FileTypeFilterPopupProps {
  onClose: () => void;
}

/**
 * Popup for enabling/disabling which file types show in the tree. Groups come
 * from the Rust backend; a Custom column lets the user add their own types.
 */
export function FileTypeFilterPopup({ onClose }: FileTypeFilterPopupProps) {
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

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

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

  return (
    <div
      className="absolute right-0 z-50 rounded-lg"
      style={{
        top: 'calc(100% + 8px)',
        width: 'min(560px, calc(100vw - 32px))',
        maxHeight: '70vh',
        overflowY: 'auto',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
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

      {/* Columns of grouped checkboxes */}
      <div className="p-4 flex flex-wrap gap-6">
        {columns.map((col) => {
          const allEnabled = col.types.length > 0 && col.types.every((t) => isEnabled(t));
          return (
            <div key={col.label} style={{ minWidth: '130px' }}>
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
                    className="text-xs"
                    style={{ color: 'var(--accent-primary)' }}
                    title={allEnabled ? 'Disable all in group' : 'Enable all in group'}
                  >
                    {allEnabled ? 'none' : 'all'}
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
  );
}
