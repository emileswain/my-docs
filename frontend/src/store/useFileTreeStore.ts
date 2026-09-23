import { create } from 'zustand';
import type { FileItem } from '../types';

export interface FileTreeCache {
  cache: Map<string, FileItem[]>;
  rootItems: FileItem[];
  lastUpdated: number;
  /** True once the full tree has hydrated in the background (search-ready). */
  hydrated?: boolean;
}

/**
 * useFileTreeStore - Global state store for file tree cache data
 *
 * Purpose:
 * - Caches complete file tree structure per project
 * - Provides fast lookups for folder contents
 * - Tracks cache freshness with timestamps
 *
 * Used by:
 * - useFileTree hook (primary consumer for all file tree operations)
 * - FileTree component (via useFileTree hook)
 *
 * State:
 * - fileTreeCache: Per-project mapping of file tree data
 *   - cache: Map data structure for O(1) folder lookups
 *   - rootItems: Top-level files and folders for the project
 *   - lastUpdated: Timestamp for cache invalidation tracking
 *
 * Special considerations:
 * - Uses Map instead of object for folder cache to provide O(1) lookups
 * - Cache is NOT persisted to localStorage (loads fresh on mount)
 * - Each project has independent cache that can be cleared separately
 * - Timestamp enables future cache invalidation strategies
 */
interface FileTreeState {
  fileTreeCache: Record<string, FileTreeCache>;
  setFileTreeCache: (projectId: string, data: FileTreeCache) => void;
  mergeFolderItems: (projectId: string, folderPath: string, items: FileItem[]) => void;
  clearCache: (projectId: string) => void;
  getCache: (projectId: string) => FileTreeCache | undefined;
}

export const useFileTreeStore = create<FileTreeState>((set, get) => ({
  fileTreeCache: {},

  setFileTreeCache: (projectId, data) => set((state) => ({
    fileTreeCache: { ...state.fileTreeCache, [projectId]: data }
  })),

  // Splice a single folder's contents into the cache (for lazy expand). Clones
  // the Map so React sees a new reference and re-renders.
  mergeFolderItems: (projectId, folderPath, items) => set((state) => {
    const existing = state.fileTreeCache[projectId];
    if (!existing) return {};
    const cache = new Map(existing.cache);
    cache.set(folderPath, items);
    return {
      fileTreeCache: {
        ...state.fileTreeCache,
        [projectId]: { ...existing, cache },
      },
    };
  }),

  clearCache: (projectId) => set((state) => {
    const newCache = { ...state.fileTreeCache };
    delete newCache[projectId];
    return { fileTreeCache: newCache };
  }),

  getCache: (projectId) => {
    return get().fileTreeCache[projectId];
  },
}));
