import { useState, useEffect, useCallback } from 'react';
import type { FileItem } from '../types';
import { useStore } from '../store/useStore';
import { browseProject } from '../services/api';

interface FileTreeItemProps {
  item: FileItem;
  onFileSelect: (path: string, name: string) => void;
  projectId: string;
  openFolders: string[];
  filter?: string;
}

function FileTreeItem({ item, onFileSelect, projectId, openFolders, filter }: FileTreeItemProps) {
  const [children, setChildren] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toggleFolder = useStore((state) => state.toggleFolder);
  const currentProject = useStore((state) => state.currentProject);

  const isOpen = openFolders.includes(item.path);

  // Filter children if filter is active
  const filteredChildren = filter
    ? children.filter((child) => fuzzyMatch(child.name, filter) || fuzzyMatch(child.path, filter))
    : children;

  const loadFolderContent = async () => {
    if (!currentProject || children.length > 0) return;

    setIsLoading(true);
    try {
      const relativePath = item.path.startsWith(currentProject.path)
        ? item.path.substring(currentProject.path.length).replace(/^\/+/, '')
        : '';

      const data = await browseProject(projectId, relativePath || undefined);
      setChildren(data.items);
    } catch (error) {
      console.error('Error loading folder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFolder(projectId, item.path);

    if (!isOpen && children.length === 0) {
      await loadFolderContent();
    }
  };

  const handleFileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(item.path, item.name);
  };

  useEffect(() => {
    if (isOpen && children.length === 0) {
      loadFolderContent();
    }
  }, [isOpen]);

  if (item.type === 'folder') {
    const folderIcon = isOpen ? 'fa-folder-open' : 'fa-folder';
    return (
      <div>
        <div
          className="tree-item py-1 px-2 rounded cursor-pointer hover:bg-gray-100"
          onClick={handleToggle}
        >
          <i className={`fas ${folderIcon} text-blue-500 mr-2`}></i>
          <span>{item.name}</span>
        </div>
        {isOpen && (
          <div className="ml-4">
            {isLoading ? (
              <div className="text-gray-400 text-sm py-1 px-2">Loading...</div>
            ) : (
              filteredChildren.map((child) => (
                <FileTreeItem
                  key={child.path}
                  item={child}
                  onFileSelect={onFileSelect}
                  projectId={projectId}
                  openFolders={openFolders}
                  filter={filter}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  const icon = getFileIcon(item.extension || '');
  return (
    <div
      className="tree-item py-1 px-2 rounded cursor-pointer hover:bg-gray-100"
      onClick={handleFileClick}
    >
      <i className={`fas ${icon} text-gray-500 mr-2`}></i>
      <span>{item.name}</span>
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

  const currentProject = useStore((state) => state.currentProject);
  const openFoldersFromStore = useStore((state) => state.openFolders);
  const setOpenFoldersGlobal = useStore((state) => state.setOpenFolders);
  const leftPanelVisible = useStore((state) => state.leftPanelVisible);
  const setLeftPanelVisible = useStore((state) => state.setLeftPanelVisible);

  // Get open folders for the current project from the store
  const openFolders = currentProject ? (openFoldersFromStore[currentProject.id] || []) : [];

  const loadProjectContents = useCallback(async () => {
    if (!currentProject) return;

    try {
      const data = await browseProject(currentProject.id);
      setItems(data.items);
    } catch (error) {
      console.error('Error loading project:', error);
    }
  }, [currentProject]);

  useEffect(() => {
    if (currentProject) {
      loadProjectContents();
    }
  }, [currentProject, loadProjectContents]);

  const handleToggleExpand = async () => {
    if (!currentProject) return;

    if (allExpanded) {
      setOpenFoldersGlobal(currentProject.id, []);
      setAllExpanded(false);
    } else {
      // Expand all folders - collect all folder paths
      const allFolders = await getAllFolderPaths(currentProject.id, currentProject.path);
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
    }
  };

  const clearFilter = () => {
    setFilter('');
  };

  // Recursively check if item or any descendants match the filter
  const itemMatchesFilter = (item: FileItem, filterText: string): boolean => {
    if (!filterText) return true;

    // Check if the item itself matches
    if (fuzzyMatch(item.name, filterText) || fuzzyMatch(item.path, filterText)) {
      return true;
    }

    // For folders, we'll check descendants when they're loaded
    // For now, just match against the folder name
    return false;
  };

  // Auto-expand folders that contain matching files
  const expandFoldersWithMatches = async (filterText: string) => {
    if (!currentProject || !filterText) return;

    const foldersToExpand: string[] = [];

    // Recursively search for matches and collect parent folders
    const searchInFolder = async (folderPath: string): Promise<boolean> => {
      const relativePath = folderPath.startsWith(currentProject.path)
        ? folderPath.substring(currentProject.path.length).replace(/^\/+/, '')
        : '';

      try {
        const data = await browseProject(currentProject.id, relativePath || undefined);
        let hasMatch = false;

        for (const item of data.items) {
          if (item.type === 'file') {
            if (fuzzyMatch(item.name, filterText) || fuzzyMatch(item.path, filterText)) {
              hasMatch = true;
            }
          } else if (item.type === 'folder') {
            const childHasMatch = await searchInFolder(item.path);
            if (childHasMatch) {
              foldersToExpand.push(item.path);
              hasMatch = true;
            }
          }
        }

        return hasMatch;
      } catch (error) {
        console.error('Error searching folder:', error);
        return false;
      }
    };

    // Search starting from root
    for (const item of items) {
      if (item.type === 'folder') {
        const hasMatch = await searchInFolder(item.path);
        if (hasMatch) {
          foldersToExpand.push(item.path);
        }
      }
    }

    // Update open folders to include all folders with matches
    if (foldersToExpand.length > 0) {
      setOpenFoldersGlobal(currentProject.id, foldersToExpand);
    }
  };

  const filteredItems = filter
    ? items.filter((item) => itemMatchesFilter(item, filter))
    : items;

  if (!leftPanelVisible) {
    return (
      <div className="bg-white border-r border-gray-200 flex items-start p-2">
        <button
          onClick={() => setLeftPanelVisible(true)}
          className="p-1 text-gray-600 hover:text-gray-800"
          title="Show Files"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border-r border-gray-200 panel flex flex-col" style={{ minWidth: '200px', width: '300px' }}>
      <div className="flex items-center px-4 border-b border-gray-200 bg-gray-50 gap-2 flex-shrink-0" style={{ height: '60px' }}>
        <input
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Filter files..."
          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
        />
        {filter && (
          <button
            onClick={clearFilter}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Clear Filter"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          onClick={handleToggleExpand}
          className="p-1 text-gray-500 hover:text-gray-700"
          title="Expand/Collapse All"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={() => setLeftPanelVisible(false)}
          className="p-1 text-gray-500 hover:text-gray-700"
          title="Hide Panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="text-sm p-4 flex-1 overflow-y-auto">
        {!currentProject ? (
          <p className="text-gray-400 italic text-sm">Select a project to browse</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-gray-400 italic text-sm">No files found</p>
        ) : (
          filteredItems.map((item) => (
            <FileTreeItem
              key={item.path}
              item={item}
              onFileSelect={onFileSelect}
              projectId={currentProject.id}
              openFolders={openFolders}
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

  let patternIdx = 0;
  let strIdx = 0;

  while (strIdx < str.length && patternIdx < pattern.length) {
    if (str[strIdx] === pattern[patternIdx]) {
      patternIdx++;
    }
    strIdx++;
  }

  return patternIdx === pattern.length;
}

async function getAllFolderPaths(projectId: string, projectPath: string): Promise<string[]> {
  const allPaths: string[] = [];

  async function collectPaths(path = ''): Promise<void> {
    const relativePath = path.startsWith(projectPath)
      ? path.substring(projectPath.length).replace(/^\/+/, '')
      : '';

    try {
      const data = await browseProject(projectId, relativePath || undefined);

      for (const item of data.items) {
        if (item.type === 'folder') {
          allPaths.push(item.path);
          await collectPaths(item.path);
        }
      }
    } catch (error) {
      console.error('Error collecting folder paths:', error);
    }
  }

  await collectPaths(projectPath);
  return allPaths;
}
