import { useState, useEffect, useCallback } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useFavouritesStore } from '../../store/useFavouritesStore';
import { settingsService } from '../../services/settingsService';
import type { FileItem } from '../../types';

interface FavouriteFilesProps {
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

export function FavouriteFiles({ onFileSelect }: FavouriteFilesProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const currentProject = useProjectStore((state) => state.currentSubProject);
  const currentFile = useProjectStore((state) => state.currentFile);
  const favourites = useFavouritesStore((state) => state.favourites);
  const toggleFavourite = useFavouritesStore((state) => state.toggleFavourite);

  const loadFavouriteFiles = useCallback(async () => {
    if (!currentProject) {
      setFiles([]);
      return;
    }
    try {
      const result = await settingsService.getFavouriteFiles(currentProject.id);
      setFiles(result);
    } catch (err) {
      console.error('Failed to load favourite files:', err);
    }
  }, [currentProject]);

  // Reload when the project changes or the favourites set changes.
  useEffect(() => {
    loadFavouriteFiles();
  }, [loadFavouriteFiles, favourites]);

  if (files.length === 0) return null;

  return (
    <div style={{ borderBottom: '1px solid var(--border-primary)' }}>
      {/* Section header */}
      <div
        className="flex items-center gap-2 px-4 py-1.5 cursor-pointer"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-secondary)',
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <i
          className={`fas fa-${collapsed ? 'chevron-right' : 'chevron-down'} text-xs`}
          style={{ color: 'var(--text-tertiary)', width: '8px' }}
        />
        <i className="fas fa-star text-xs" style={{ color: 'var(--accent-primary)' }} />
        <span className="text-xs font-semibold flex-1" style={{ color: 'var(--text-secondary)' }}>
          Favourites
        </span>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {files.length}
        </span>
      </div>

      {/* Files */}
      {!collapsed && (
        <div className="py-1">
          {files.map((file) => {
            const isSelected = currentFile === file.path;
            return (
              <div
                key={file.path}
                className="group flex items-center gap-2 px-4 py-1 cursor-pointer rounded mx-1"
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
                  style={{ color: 'var(--text-primary)', fontWeight: isSelected ? 600 : 400 }}
                >
                  {file.name}
                </span>
                <button
                  className="p-0.5 rounded flex-shrink-0"
                  style={{ color: 'var(--accent-primary)' }}
                  title="Remove from favourites"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavourite(file.path);
                  }}
                >
                  <i className="fas fa-star text-xs" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
