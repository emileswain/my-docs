import type { Project, BrowseResponse, FileContent } from '../types';

const API_BASE = '/api';

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/projects`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
}

export async function browseProject(
  projectId: string,
  path?: string
): Promise<BrowseResponse> {
  const url = path
    ? `${API_BASE}/projects/${projectId}/browse/${path}`
    : `${API_BASE}/projects/${projectId}/browse`;

  const response = await fetch(url);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to browse project');
  }
  return response.json();
}

export async function fetchFileContent(path: string): Promise<FileContent> {
  // Remove leading slash from path
  const encodedPath = path.startsWith('/') ? path.substring(1) : path;
  const response = await fetch(`${API_BASE}/file/${encodedPath}`);

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch file content');
  }
  return response.json();
}
