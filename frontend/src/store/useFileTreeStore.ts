import { create } from 'zustand';
import type { FileItem } from '../types';

export interface FileTreeCache {
  cache: Map<string, FileItem[]>;
  rootItems: FileItem[];
  lastUpdated: number;
}

interface FileTreeState {
  fileTreeCache: Record<string, FileTreeCache>;
  setFileTreeCache: (projectId: string, data: FileTreeCache) => void;
  clearCache: (projectId: string) => void;
  getCache: (projectId: string) => FileTreeCache | undefined;
}

export const useFileTreeStore = create<FileTreeState>((set, get) => ({
  fileTreeCache: {},

  setFileTreeCache: (projectId, data) => set((state) => ({
    fileTreeCache: { ...state.fileTreeCache, [projectId]: data }
  })),

  clearCache: (projectId) => set((state) => {
    const newCache = { ...state.fileTreeCache };
    delete newCache[projectId];
    return { fileTreeCache: newCache };
  }),

  getCache: (projectId) => {
    return get().fileTreeCache[projectId];
  },
}));
