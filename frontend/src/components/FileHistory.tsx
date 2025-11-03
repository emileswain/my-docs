import { useProjectStore } from '../store/useProjectStore';
import { getFileHistory, formatTimestamp, type FileHistoryEntry } from '../utils/fileHistory';

interface FileHistoryProps {
  onLoadHistory: (content: string) => void;
}

export function FileHistory({ onLoadHistory }: FileHistoryProps) {
  const currentFile = useProjectStore((state) => state.currentFile);
  const currentProject = useProjectStore((state) => state.currentProject);

  if (!currentFile || !currentProject) {
    return (
      <div className="text-sm p-4" style={{ color: 'var(--text-tertiary)' }}>
        <p className="italic">No file selected</p>
      </div>
    );
  }

  const history = getFileHistory(currentProject.id, currentFile);

  if (history.length === 0) {
    return (
      <div className="text-sm p-4" style={{ color: 'var(--text-tertiary)' }}>
        <p className="italic">No save history yet</p>
        <p className="text-xs mt-2">History will appear here after you save changes</p>
      </div>
    );
  }

  return (
    <div className="text-sm">
      {history.map((entry: FileHistoryEntry, index: number) => (
        <div
          key={entry.timestamp}
          className="history-item p-3 cursor-pointer border-b hover:bg-opacity-50"
          style={{
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)',
          }}
          onClick={() => onLoadHistory(entry.content)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">
              {index === 0 ? 'Latest' : `Save ${index + 1}`}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {formatTimestamp(entry.timestamp)}
            </span>
          </div>
          <div
            className="text-xs mt-1 truncate"
            style={{ color: 'var(--text-secondary)' }}
          >
            {entry.content.substring(0, 50)}
            {entry.content.length > 50 ? '...' : ''}
          </div>
        </div>
      ))}
    </div>
  );
}
