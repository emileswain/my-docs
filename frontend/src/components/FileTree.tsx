import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FileItem } from '../types';
import { useStore } from '../store/useStore';
import { browseProject } from '../services/api';

interface FileTreeItemProps {
  item: FileItem;
  onFileSelect: (path: string, name: string) => void;
  projectId: string;
  openFolders: string[];
  filter?: string;
  allItems: Map<string, FileItem[]>; // Cache of all folder contents
}

function FileTreeItem({ item, onFileSelect, projectId, openFolders, filter, allItems }: FileTreeItemProps) {
  const toggleFolder = useStore((state) => state.toggleFolder);
  const currentFile = useStore((state) => state.currentFile);

  const isOpen = openFolders.includes(item.path);
  const isSelected = item.type === 'file' && currentFile === item.path;

  // Get children from cache
  const children = allItems.get(item.path) || [];

  // Check if this item matches the filter (only check filename, not path)
  const itemMatches = !filter || fuzzyMatch(item.name, filter);

  // For folders, show if folder itself matches OR if it's in openFolders (meaning it has matching children)
  const shouldShowFolder = !filter || itemMatches || isOpen;

  // For files, show only if matches
  const shouldShowFile = !filter || itemMatches;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFolder(projectId, item.path);
  };

  const handleFileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(item.path, item.name);
  };

  if (item.type === 'folder') {
    // Don't render folder if it doesn't match filter criteria
    if (!shouldShowFolder) return null;

    const folderIcon = isOpen ? 'fa-folder-open' : 'fa-folder';
    return (
      <div>
        <div
          className="tree-item py-1 px-2 rounded cursor-pointer"
          onClick={handleToggle}
        >
          <i className={`fas ${folderIcon} mr-2`} style={{ color: 'var(--accent-primary)' }}></i>
          <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
        </div>
        {isOpen && (
          <div className="ml-4">
            {children.map((child) => (
              <FileTreeItem
                key={child.path}
                item={child}
                onFileSelect={onFileSelect}
                projectId={projectId}
                openFolders={openFolders}
                filter={filter}
                allItems={allItems}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Don't render file if it doesn't match filter
  if (!shouldShowFile) return null;

  const icon = getFileIcon(item.extension || '');
  return (
    <div
      className="tree-item py-1 px-2 rounded cursor-pointer"
      style={{
        backgroundColor: isSelected ? 'var(--accent-secondary)' : 'transparent',
        fontWeight: isSelected ? 600 : 400
      }}
      onClick={handleFileClick}
    >
      <i
        className={`fas ${icon} mr-2`}
        style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
      ></i>
      <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
    </div>
  );
}

function getFileIcon(extension: string): string {
  const icons: Record<string, string> = {
    '.md': 'fa-file-alt',
    '.json': 'fa-file-code',
    '.yml': 'fa-file-code',
    '.yaml': 'fa-file-code',
  };
  return icons[extension] || 'fa-file';
}

interface FileTreeProps {
  onFileSelect: (path: string, name: string) => void;
}

export function FileTree({ onFileSelect }: FileTreeProps) {
  const [items, setItems] = useState<FileItem[]>([]);
  const [filter, setFilter] = useState('');
  const [allExpanded, setAllExpanded] = useState(false);
  const [isLoadingCache, setIsLoadingCache] = useState(false);
  const [allItems, setAllItems] = useState<Map<string, FileItem[]>>(new Map());

  const currentProject = useStore((state) => state.currentProject);
  const currentFile = useStore((state) => state.currentFile);
  const openFoldersFromStore = useStore((state) => state.openFolders);
  const setOpenFoldersGlobal = useStore((state) => state.setOpenFolders);
  const leftPanelVisible = useStore((state) => state.leftPanelVisible);
  const setLeftPanelVisible = useStore((state) => state.setLeftPanelVisible);

  // Get open folders for the current project from the store
  const openFolders = currentProject ? (openFoldersFromStore[currentProject.id] || []) : [];

  // Recursively load all folder contents and cache them
  const loadAllFolders = useCallback(async (projectId: string, projectPath: string) => {
    const cache = new Map<string, FileItem[]>();

    const loadFolder = async (folderPath: string): Promise<FileItem[]> => {
      const relativePath = folderPath.startsWith(projectPath)
        ? folderPath.substring(projectPath.length).replace(/^\/+/, '')
        : '';

      try {
        const data = await browseProject(projectId, relativePath || undefined);
        cache.set(folderPath, data.items);

        // Recursively load subfolders
        const subfolderPromises = data.items
          .filter(item => item.type === 'folder')
          .map(folder => loadFolder(folder.path));

        await Promise.all(subfolderPromises);

        return data.items;
      } catch (error) {
        console.error('Error loading folder:', folderPath, error);
        return [];
      }
    };

    const rootItems = await loadFolder(projectPath);
    return { cache, rootItems };
  }, []);

  const loadProjectContents = useCallback(async () => {
    if (!currentProject) return;

    setIsLoadingCache(true);
    try {
      const { cache, rootItems } = await loadAllFolders(currentProject.id, currentProject.path);
      setAllItems(cache);
      setItems(rootItems);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoadingCache(false);
    }
  }, [currentProject, loadAllFolders]);

  useEffect(() => {
    if (currentProject) {
      loadProjectContents();
    }
  }, [currentProject, loadProjectContents]);

  // Listen for file system changes via Server-Sent Events
  useEffect(() => {
    if (!currentProject) return;

    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Only refresh if the change is for the current project
        if (data.project_id === currentProject.id) {
          console.log('File system change detected, refreshing cache...', data);
          loadProjectContents();
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [currentProject, loadProjectContents]);

  // Expand to show current file when it changes
  useEffect(() => {
    if (currentFile && currentProject && !filter) {
      expandToCurrentFile();
    }
  }, [currentFile, currentProject, filter]);

  const handleToggleExpand = () => {
    if (!currentProject) return;

    if (allExpanded) {
      setOpenFoldersGlobal(currentProject.id, []);
      setAllExpanded(false);
    } else {
      // Expand all folders - get all folder paths from cache
      const allFolders = Array.from(allItems.keys());
      setOpenFoldersGlobal(currentProject.id, allFolders);
      setAllExpanded(true);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = e.target.value;
    setFilter(newFilter);

    // Auto-expand folders containing matches when filtering
    if (newFilter && currentProject) {
      expandFoldersWithMatches(newFilter);
    } else if (!newFilter && currentProject) {
      // Clear expanded folders when filter is cleared
      setOpenFoldersGlobal(currentProject.id, []);
    }
  };

  const clearFilter = () => {
    setFilter('');
    if (currentProject) {
      // Expand to show current file location instead of collapsing all
      expandToCurrentFile();
    }
  };

  const expandToCurrentFile = useCallback(() => {
    if (!currentProject || !currentFile) {
      if (currentProject) {
        setOpenFoldersGlobal(currentProject.id, []);
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

    setOpenFoldersGlobal(currentProject.id, foldersToOpen);
  }, [currentProject, currentFile, setOpenFoldersGlobal]);

  // Auto-expand folders that contain matching files and show ALL matches
  const expandFoldersWithMatches = (filterText: string) => {
    if (!currentProject || !filterText) return;

    const foldersToExpand: string[] = [];

    // Recursively search for matches and collect parent folders using cache
    const searchInFolder = (folderPath: string, ancestorPaths: string[] = []): boolean => {
      const folderItems = allItems.get(folderPath) || [];
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
    for (const item of items) {
      if (item.type === 'folder') {
        searchInFolder(item.path, [item.path]);
      }
      // Top-level files don't need folder expansion
    }

    // Update open folders to include all folders with matches
    setOpenFoldersGlobal(currentProject.id, foldersToExpand);
  };

  // Don't filter top-level items - show all, filtering happens in children
  const filteredItems = items;

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
        ) : isLoadingCache ? (
          <p className="italic text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading file tree...</p>
        ) : filteredItems.length === 0 ? (
          <p className="italic text-sm" style={{ color: 'var(--text-tertiary)' }}>No files found</p>
        ) : (
          filteredItems.map((item) => (
            <FileTreeItem
              key={item.path}
              item={item}
              onFileSelect={onFileSelect}
              projectId={currentProject.id}
              openFolders={openFolders}
              filter={filter}
              allItems={allItems}
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
