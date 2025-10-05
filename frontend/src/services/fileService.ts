import type { FileItem, FileContent } from '../types';

export interface BrowseResponse {
  items: FileItem[];
}

/**
 * FileService - Handles all file browsing and content retrieval operations
 *
 * Purpose:
 * - Browses project directories and retrieves file listings
 * - Fetches file content with parsed tree structure
 * - Recursively loads entire folder hierarchies for caching
 *
 * Used by:
 * - useFileTree hook (for loading file tree cache)
 * - useFileContent hook (for loading individual files)
 *
 * Special considerations:
 * - browseAllFolders() recursively loads ALL folders - may take time for large projects
 * - Returns Map data structure for O(1) folder lookups in cache
 * - fetchFileContent() returns parsed content including tree structure and HTML (for markdown)
 * - All methods throw errors on failure - consumers should handle with try/catch
 */
export class FileService {
  async browseProject(
    projectId: string,
    path?: string
  ): Promise<BrowseResponse> {
    const url = path
      ? `/api/projects/${projectId}/browse/${path}`
      : `/api/projects/${projectId}/browse`;

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to browse project');
    }

    return response.json();
  }

  async fetchFileContent(path: string): Promise<FileContent> {
    const encodedPath = path.startsWith('/') ? path.substring(1) : path;
    const response = await fetch(`/api/file/${encodedPath}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch file content');
    }

    return response.json();
  }

  async browseAllFolders(
    projectId: string,
    projectPath: string
  ): Promise<{ cache: Map<string, FileItem[]>; rootItems: FileItem[] }> {
    const url = `/api/projects/${projectId}/browse-all`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to browse all folders');
      }

      const data = await response.json();

      // Convert cache object to Map
      const cache = new Map<string, FileItem[]>();
      for (const [path, items] of Object.entries(data.cache)) {
        cache.set(path, items as FileItem[]);
      }

      return {
        cache,
        rootItems: data.rootItems
      };
    } catch (error) {
      console.error('Error loading all folders:', error);
      throw error;
    }
  }
}

export const fileService = new FileService();
