import { useState, useCallback } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { useFileTreeStore } from '../store/useFileTreeStore';
import { fileService } from '../services/fileService';
import type { FileItem } from '../types';

/**
 * useFileTree - Custom hook for managing file tree state and operations
 *
 * Purpose:
 * - Loads and caches entire file tree for a project
 * - Manages folder expand/collapse state
 * - Provides file tree data and operations to components
 *
 * Used by:
 * - FileTree component (primary consumer)
 *
 * Parameters:
 * - projectId: ID of the current project (null if no project selected)
 *
 * Returns:
 * - isLoading: Boolean indicating if file tree is being loaded
 * - treeData: Cached file tree data (includes cache Map and rootItems array)
 * - openFolders: Array of currently expanded folder paths
 * - loadFileTree: Function to load/reload the entire file tree
 * - toggleFolder: Function to expand/collapse a single folder
 * - setOpenFolders: Function to set multiple folders as open/closed
 *
 * Special considerations:
 * - Recursively loads ALL folders on initial load - may take time for large projects
 * - Cache is stored per-project in FileTreeStore
 * - Open folder state is persisted to localStorage
 * - All operations are no-ops if projectId is null
 */
export function useFileTree(projectId: string | null) {
  const [isLoading, setIsLoading] = useState(false);

  const currentSubProject = useProjectStore((state) => state.currentSubProject);
  const openFolders = useProjectStore((state) => state.openFolders);
  const setOpenFolders = useProjectStore((state) => state.setOpenFolders);
  const toggleFolder = useProjectStore((state) => state.toggleFolder);

  const fileTreeCache = useFileTreeStore((state) => state.fileTreeCache);
  const setFileTreeCache = useFileTreeStore((state) => state.setFileTreeCache);
  const mergeFolderItems = useFileTreeStore((state) => state.mergeFolderItems);
  const getCache = useFileTreeStore((state) => state.getCache);

  // Full path -> subpath relative to the project root (for browse_project).
  const toSubpath = useCallback((root: string, path: string) => {
    return path === root ? '' : path.startsWith(root + '/') ? path.slice(root.length + 1) : path;
  }, []);

  // Hydrate the entire tree in the background and mark it search-ready.
  const hydrateFull = useCallback(async (id: string) => {
    try {
      const { cache, rootItems } = await fileService.browseAllFolders(id);
      setFileTreeCache(id, { cache, rootItems, lastUpdated: Date.now(), hydrated: true });
    } catch (error) {
      console.error('Background tree hydration failed:', error);
    }
  }, [setFileTreeCache]);

  /**
   * Progressive load: paint the root + already-open folders immediately, then
   * hydrate the full tree in the background so search works. If a cache already
   * exists (project revisit or fs-change), just re-hydrate silently without
   * collapsing what's shown.
   */
  const loadFileTree = useCallback(async () => {
    if (!projectId) return;
    if (!currentSubProject || currentSubProject.id !== projectId) return;

    const root = currentSubProject.path;

    // Existing cache (revisit / fs-change refresh): re-hydrate silently.
    if (getCache(projectId)) {
      hydrateFull(projectId);
      return;
    }

    setIsLoading(true);
    try {
      // Initial slice: root + folders restored as open, in parallel.
      const open = (openFolders[projectId] || []).filter((p) => p !== root);
      const paths = [root, ...open];
      const entries = await Promise.all(
        paths.map(async (p) => {
          try {
            const { items } = await fileService.browseProject(projectId, toSubpath(root, p));
            return [p, items] as const;
          } catch {
            return [p, [] as FileItem[]] as const;
          }
        })
      );
      const cache = new Map<string, FileItem[]>(entries);
      setFileTreeCache(projectId, {
        cache,
        rootItems: cache.get(root) || [],
        lastUpdated: Date.now(),
        hydrated: false,
      });
    } catch (error) {
      console.error('Error loading file tree:', error);
    } finally {
      setIsLoading(false);
    }

    // Background: full hydration for search + instant expands.
    hydrateFull(projectId);
  }, [projectId, currentSubProject, openFolders, getCache, hydrateFull, setFileTreeCache, toSubpath]);

  // Lazy-load a single folder on expand (no-op if already cached).
  const loadFolder = useCallback(async (folderPath: string) => {
    if (!projectId || !currentSubProject) return;
    const existing = getCache(projectId);
    if (existing?.cache.has(folderPath)) return;
    try {
      const { items } = await fileService.browseProject(
        projectId,
        toSubpath(currentSubProject.path, folderPath)
      );
      mergeFolderItems(projectId, folderPath, items);
    } catch (error) {
      console.error('Error loading folder:', error);
    }
  }, [projectId, currentSubProject, getCache, mergeFolderItems, toSubpath]);

  const getTreeData = useCallback(() => {
    if (!projectId) return null;
    return fileTreeCache[projectId];
  }, [projectId, fileTreeCache]);

  const getOpenFolders = useCallback(() => {
    if (!projectId) return [];
    return openFolders[projectId] || [];
  }, [projectId, openFolders]);

  const handleToggleFolder = useCallback((path: string) => {
    if (!projectId) return;
    const wasOpen = (openFolders[projectId] || []).includes(path);
    toggleFolder(projectId, path);
    // Opening a folder that isn't loaded yet (pre-hydration): fetch just it.
    if (!wasOpen) {
      loadFolder(path);
    }
  }, [projectId, openFolders, toggleFolder, loadFolder]);

  const handleSetOpenFolders = useCallback((folders: string[]) => {
    if (projectId) {
      setOpenFolders(projectId, folders);
    }
  }, [projectId, setOpenFolders]);

  return {
    isLoading,
    treeData: getTreeData(),
    openFolders: getOpenFolders(),
    loadFileTree,
    toggleFolder: handleToggleFolder,
    setOpenFolders: handleSetOpenFolders,
  };
}
