import { useState, useEffect, useCallback } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useAppStore } from '../../store/useAppStore';
import { useFileTree } from '../../hooks/useFileTree';
import { useFileSystemEvents } from '../../hooks/useFileSystemEvents';
import { FileTreeItem } from './FileTreeItem';

interface FileTreeProps {
  onFileSelect: (path: string, name: string) => void;
}

export function FileTree({ onFileSelect }: FileTreeProps) {
  const [filter, setFilter] = useState('');
  const [allExpanded, setAllExpanded] = useState(false);

  const currentProject = useProjectStore((state) => state.currentProject);
  const currentFile = useProjectStore((state) => state.currentFile);
  const leftPanelVisible = useAppStore((state) => state.leftPanelVisible);
  const setLeftPanelVisible = useAppStore((state) => state.setLeftPanelVisible);

  const {
    isLoading,
    treeData,
    openFolders,
    loadFileTree,
    toggleFolder,
    setOpenFolders,
  } = useFileTree(currentProject?.id || null);

  // Load file tree when project changes
  useEffect(() => {
    if (currentProject) {
      loadFileTree();
    }
  }, [currentProject, loadFileTree]);

  // Listen for file system changes
  useFileSystemEvents(currentProject?.id || null, useCallback(() => {
    console.log('File system change detected, refreshing cache...');
    loadFileTree();
  }, [loadFileTree]));

  // Expand to show current file when it changes
  useEffect(() => {
    if (currentFile && currentProject && !filter) {
      expandToCurrentFile();
    }
  }, [currentFile, currentProject, filter]);

  const expandToCurrentFile = useCallback(() => {
    if (!currentProject || !currentFile) {
      if (currentProject) {
        setOpenFolders([]);
      }
      return;
    }

    // Get all parent folders of the current file
    const pathParts = currentFile.split('/').filter(p => p);
    const foldersToOpen: string[] = [];
    let currentPath = '';

    // Build up the path to the current file
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentPath += '/' + pathParts[i];
      foldersToOpen.push(currentPath);
    }

    setOpenFolders(foldersToOpen);
  }, [currentProject, currentFile, setOpenFolders]);

  const handleToggleExpand = () => {
    if (!currentProject || !treeData) return;

    if (allExpanded) {
      setOpenFolders([]);
      setAllExpanded(false);
    } else {
      // Expand all folders - get all folder paths from cache
      const allFolders = Array.from(treeData.cache.keys());
      setOpenFolders(allFolders);
      setAllExpanded(true);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = e.target.value;
    setFilter(newFilter);

    // Auto-expand folders containing matches when filtering
    if (newFilter && currentProject && treeData) {
      expandFoldersWithMatches(newFilter);
    } else if (!newFilter && currentProject) {
      // Clear expanded folders when filter is cleared
      setOpenFolders([]);
    }
  };

  const clearFilter = () => {
    setFilter('');
    if (currentProject) {
      // Expand to show current file location instead of collapsing all
      expandToCurrentFile();
    }
  };

  const expandFoldersWithMatches = (filterText: string) => {
    if (!currentProject || !filterText || !treeData) return;

    const foldersToExpand: string[] = [];

    // Recursively search for matches and collect parent folders using cache
    const searchInFolder = (folderPath: string, ancestorPaths: string[] = []): boolean => {
      const folderItems = treeData.cache.get(folderPath) || [];
      let hasMatch = false;

      for (const item of folderItems) {
        if (item.type === 'file') {
          // Check if file name matches (not path, only filename)
          if (fuzzyMatch(item.name, filterText)) {
            hasMatch = true;
            // Add all ancestor folders to expansion list
            ancestorPaths.forEach(path => {
              if (!foldersToExpand.includes(path)) {
                foldersToExpand.push(path);
              }
            });
          }
        } else if (item.type === 'folder') {
          // Check folder name itself
          const folderMatches = fuzzyMatch(item.name, filterText);

          // Recursively check children
          const childHasMatch = searchInFolder(item.path, [...ancestorPaths, folderPath, item.path]);

          if (childHasMatch || folderMatches) {
            hasMatch = true;
            // Add this folder and all ancestors to expansion list
            if (!foldersToExpand.includes(item.path)) {
              foldersToExpand.push(item.path);
            }
            ancestorPaths.forEach(path => {
              if (!foldersToExpand.includes(path)) {
                foldersToExpand.push(path);
              }
            });
          }
        }
      }

      return hasMatch;
    };

    // Search starting from root
    for (const item of treeData.rootItems) {
      if (item.type === 'folder') {
        searchInFolder(item.path, [item.path]);
      }
      // Top-level files don't need folder expansion
    }

    // Update open folders to include all folders with matches
    setOpenFolders(foldersToExpand);
  };

  if (!leftPanelVisible) {
    return (
      <div
        className="flex items-start p-2"
        style={{
          backgroundColor: 'var(--surface-panel)',
          borderRight: '1px solid var(--border-primary)'
        }}
      >
        <button
          onClick={() => setLeftPanelVisible(true)}
          className="p-1"
          style={{ color: 'var(--text-secondary)' }}
          title="Show Files"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    );
  }

  return (
    <div
      className="panel flex flex-col"
      style={{
        minWidth: '200px',
        width: '300px',
        backgroundColor: 'var(--surface-panel)',
        borderRight: '1px solid var(--border-primary)'
      }}
    >
      <div
        className="flex items-center px-4 gap-2 flex-shrink-0"
        style={{
          height: '60px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-tertiary)'
        }}
      >
        <input
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Filter files..."
          className="flex-1 px-2 py-1 text-xs rounded focus:outline-none focus:ring-1"
          style={{
            border: '1px solid var(--border-secondary)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)'
          }}
        />
        {filter && (
          <button
            onClick={clearFilter}
            className="p-1"
            style={{ color: 'var(--text-tertiary)' }}
            title="Clear Filter"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          onClick={handleToggleExpand}
          className="p-1"
          style={{ color: 'var(--text-secondary)' }}
          title={allExpanded ? "Collapse All" : "Expand All"}
        >
          {allExpanded ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 16 16">
              <line x1="2" y1="3" x2="2" y2="5" strokeWidth="2" strokeLinecap="round" />
              <line x1="2" y1="3" x2="6" y2="3" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="7" x2="8" y2="7" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="11" x2="8" y2="11" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 16 16">
              <line x1="2" y1="3" x2="2" y2="5" strokeWidth="2" strokeLinecap="round" />
              <line x1="2" y1="3" x2="6" y2="3" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="5" x2="5" y2="7" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="5" x2="8" y2="5" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="9" x2="8" y2="9" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="11" x2="5" y2="13" strokeWidth="2" strokeLinecap="round" />
              <line x1="5" y1="11" x2="8" y2="11" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <button
          onClick={() => setLeftPanelVisible(false)}
          className="p-1"
          style={{ color: 'var(--text-secondary)' }}
          title="Hide Panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="text-sm p-4 flex-1 overflow-y-auto">
        {!currentProject ? (
          <p className="italic text-sm" style={{ color: 'var(--text-tertiary)' }}>Select a project to browse</p>
        ) : isLoading ? (
          <p className="italic text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading file tree...</p>
        ) : !treeData || treeData.rootItems.length === 0 ? (
          <p className="italic text-sm" style={{ color: 'var(--text-tertiary)' }}>No files found</p>
        ) : (
          treeData.rootItems.map((item) => (
            <FileTreeItem
              key={item.path}
              item={item}
              onFileSelect={onFileSelect}
              openFolders={openFolders}
              allItems={treeData.cache}
              onToggle={toggleFolder}
              filter={filter}
            />
          ))
        )}
      </div>
    </div>
  );
}

function fuzzyMatch(str: string, pattern: string): boolean {
  if (!pattern) return true;

  str = str.toLowerCase();
  pattern = pattern.toLowerCase();

  // Simple substring match - pattern must appear consecutively in the string
  return str.includes(pattern);
}
