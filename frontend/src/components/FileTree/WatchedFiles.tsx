import { useState, useEffect, useCallback } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { settingsService } from '../../services/settingsService';
import type { WatchResult } from '../../types';

interface WatchedFilesProps {
  onFileSelect: (path: string, name: string) => void;
}

function getFileIcon(extension: string): string {
  const icons: Record<string, string> = {
    '.md': 'fa-file-alt',
    '.json': 'fa-file-code',
    '.yml': 'fa-file-code',
    '.yaml': 'fa-file-code',
    '.xml': 'fa-file-code',
    '.mmd': 'fa-project-diagram',
  };
  return icons[extension] || 'fa-file';
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function WatchedFiles({ onFileSelect }: WatchedFilesProps) {
  const [watchResults, setWatchResults] = useState<WatchResult[]>([]);
  const [collapsedWatches, setCollapsedWatches] = useState<Set<string>>(new Set());
  const currentProject = useProjectStore((state) => state.currentSubProject);
  const currentFile = useProjectStore((state) => state.currentFile);

  const loadWatchedFiles = useCallback(async () => {
    if (!currentProject) {
      setWatchResults([]);
      return;
    }
    try {
      const results = await settingsService.getWatchedFiles(currentProject.id);
      setWatchResults(results);
    } catch (err) {
      console.error('Failed to load watched files:', err);
    }
  }, [currentProject]);

  useEffect(() => {
    loadWatchedFiles();
  }, [loadWatchedFiles]);

  // Filter out watches with no files
  const activeResults = watchResults.filter(r => r.files.length > 0);

  if (activeResults.length === 0) return null;

  const toggleCollapse = (watchId: string) => {
    setCollapsedWatches(prev => {
      const next = new Set(prev);
      if (next.has(watchId)) {
        next.delete(watchId);
      } else {
        next.add(watchId);
      }
      return next;
    });
  };

  return (
    <div
      style={{ borderBottom: '1px solid var(--border-primary)' }}
    >
      {activeResults.map((result) => {
        const isCollapsed = collapsedWatches.has(result.watch.id);
        return (
          <div key={result.watch.id}>
            {/* Watch header */}
            <div
              className="flex items-center gap-2 px-4 py-1.5 cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--border-secondary)',
              }}
              onClick={() => toggleCollapse(result.watch.id)}
            >
              <i
                className={`fas fa-${isCollapsed ? 'chevron-right' : 'chevron-down'} text-xs`}
                style={{ color: 'var(--text-tertiary)', width: '8px' }}
              />
              <i
                className="fas fa-binoculars text-xs"
                style={{ color: 'var(--accent-primary)' }}
              />
              <span
                className="text-xs font-semibold flex-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                {result.watch.name}
              </span>
              <span
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {result.files.length}
              </span>
            </div>

            {/* Watch files */}
            {!isCollapsed && (
              <div className="py-1">
                {result.files.map((file) => {
                  const isSelected = currentFile === file.path;
                  return (
                    <div
                      key={file.path}
                      className="flex items-center gap-2 px-4 py-1 cursor-pointer rounded mx-1"
                      style={{
                        backgroundColor: isSelected ? 'var(--accent-secondary)' : 'transparent',
                        transition: 'background-color 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--surface-panel-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={() => onFileSelect(file.path, file.name)}
                    >
                      <i
                        className={`fas ${getFileIcon(file.extension || '')} text-xs`}
                        style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                      />
                      <span
                        className="text-xs flex-1 truncate"
                        style={{
                          color: 'var(--text-primary)',
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        {file.name}
                      </span>
                      {file.modified && (
                        <span
                          className="text-xs flex-shrink-0"
                          style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}
                        >
                          {timeAgo(file.modified)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
