import type { Project } from '../types';

export interface CreateProjectDto {
  path: string;
  title: string;
  description?: string;
}

export interface UpdateProjectDto {
  path?: string;
  title?: string;
  description?: string;
}

export class ProjectService {
  async fetchProjects(): Promise<Project[]> {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  }

  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create project');
    }

    const result = await response.json();
    return result.project;
  }

  async updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update project');
    }

    const result = await response.json();
    return result.project;
  }

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete project');
    }
  }
}

export const projectService = new ProjectService();
