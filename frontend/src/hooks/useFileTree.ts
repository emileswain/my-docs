import { useState, useCallback } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { useFileTreeStore } from '../store/useFileTreeStore';
import { fileService } from '../services/fileService';

export function useFileTree(projectId: string | null) {
  const [isLoading, setIsLoading] = useState(false);

  const projects = useProjectStore((state) => state.projects);
  const openFolders = useProjectStore((state) => state.openFolders);
  const setOpenFolders = useProjectStore((state) => state.setOpenFolders);
  const toggleFolder = useProjectStore((state) => state.toggleFolder);

  const fileTreeCache = useFileTreeStore((state) => state.fileTreeCache);
  const setFileTreeCache = useFileTreeStore((state) => state.setFileTreeCache);

  const loadFileTree = useCallback(async () => {
    if (!projectId) return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setIsLoading(true);
    try {
      const { cache, rootItems } = await fileService.browseAllFolders(
        project.id,
        project.path
      );

      setFileTreeCache(projectId, {
        cache,
        rootItems,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error('Error loading file tree:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, projects, setFileTreeCache]);

  const getTreeData = useCallback(() => {
    if (!projectId) return null;
    return fileTreeCache[projectId];
  }, [projectId, fileTreeCache]);

  const getOpenFolders = useCallback(() => {
    if (!projectId) return [];
    return openFolders[projectId] || [];
  }, [projectId, openFolders]);

  const handleToggleFolder = useCallback((path: string) => {
    if (projectId) {
      toggleFolder(projectId, path);
    }
  }, [projectId, toggleFolder]);

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
