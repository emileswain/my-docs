import { invoke } from '@tauri-apps/api/core';
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
    // Ported to the Rust engine (invoke replaces GET /browse).
    return invoke<BrowseResponse>('browse_project', { projectId, subpath: path });
  }

  async fetchFileContent(path: string): Promise<FileContent> {
    // Ported to the Rust engine (invoke replaces GET /file). The absolute path
    // is passed as-is; no URL encoding needed over IPC.
    return invoke<FileContent>('get_file', { path });
  }

  async saveFile(path: string, content: string): Promise<void> {
    const encodedPath = path.startsWith('/') ? path.substring(1) : path;
    const response = await fetch(`/api/file/${encodedPath}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save file');
    }

    return response.json();
  }

  async browseAllFolders(
    projectId: string
  ): Promise<{ cache: Map<string, FileItem[]>; rootItems: FileItem[] }> {
    try {
      // Ported to the Rust engine (invoke replaces GET /browse-all).
      const data = await invoke<{ cache: Record<string, FileItem[]>; rootItems: FileItem[] }>(
        'browse_all',
        { projectId }
      );

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
