import type { FileItem, FileContent } from '../types';

export interface BrowseResponse {
  items: FileItem[];
}

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
    const cache = new Map<string, FileItem[]>();

    const loadFolder = async (folderPath: string): Promise<FileItem[]> => {
      const relativePath = folderPath.startsWith(projectPath)
        ? folderPath.substring(projectPath.length).replace(/^\/+/, '')
        : '';

      try {
        const data = await this.browseProject(projectId, relativePath || undefined);
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
  }
}

export const fileService = new FileService();
