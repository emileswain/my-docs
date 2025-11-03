interface FileViewerHeaderProps {
  fileName: string;
  currentHeading: string;
  canToggleRaw: boolean;
  showRaw: boolean;
  onToggleRaw: () => void;
  isDirty?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  canEdit?: boolean;
}

export function FileViewerHeader({
  fileName,
  currentHeading,
  canToggleRaw,
  showRaw,
  onToggleRaw,
  isDirty,
  isSaving,
  onSave,
  canEdit = false
}: FileViewerHeaderProps) {
  return (
    <div
      className="px-6"
      style={{
        height: '60px',
        borderBottom: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-tertiary)'
      }}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex-1 min-w-0">
          <h2
            className="text-base font-semibold truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {fileName || ''}
            {isDirty && (
              <span
                className="ml-2 text-xs font-normal"
                style={{ color: 'var(--text-tertiary)' }}
              >
                (unsaved)
              </span>
            )}
          </h2>
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {currentHeading}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex gap-2">
          {isDirty && onSave && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-3 py-1 text-sm rounded"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
                transition: 'opacity 0.15s',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1
              }}
            >
              <i className={`fas fa-${isSaving ? 'spinner fa-spin' : 'save'} mr-1`}></i>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
          {canToggleRaw && (
            <button
              onClick={onToggleRaw}
              className="px-3 py-1 text-sm rounded"
              style={{
                backgroundColor: 'var(--accent-secondary)',
                color: 'var(--text-primary)',
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
            >
              <i className={`fas fa-${showRaw ? (canEdit ? 'times' : 'eye') : (canEdit ? 'edit' : 'code')} mr-1`}></i>
              {showRaw ? (canEdit ? 'Cancel' : 'Show Rendered') : (canEdit ? 'Edit' : 'Show Raw')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
