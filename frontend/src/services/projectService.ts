import type { ProjectGroup, SubProject, SubprojectType } from '../types';

export interface CreateGroupDto {
  title: string;
}

export interface UpdateGroupDto {
  title?: string;
}

export interface CreateSubProjectDto {
  path: string;
  title: string;
  description?: string;
  type?: SubprojectType;
}

export interface UpdateSubProjectDto {
  path?: string;
  title?: string;
  description?: string;
  type?: SubprojectType;
}

export class ProjectService {
  // --- Group operations ---

  async fetchGroups(): Promise<ProjectGroup[]> {
    const response = await fetch('/api/groups');
    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }
    return response.json();
  }

  async createGroup(data: CreateGroupDto): Promise<ProjectGroup> {
    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create group');
    }
    const result = await response.json();
    return result.group;
  }

  async updateGroup(id: string, data: UpdateGroupDto): Promise<ProjectGroup> {
    const response = await fetch(`/api/groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update group');
    }
    const result = await response.json();
    return result.group;
  }

  async deleteGroup(id: string): Promise<void> {
    const response = await fetch(`/api/groups/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete group');
    }
  }

  // --- Sub-project operations ---

  async createSubProject(groupId: string, data: CreateSubProjectDto): Promise<SubProject> {
    const response = await fetch(`/api/groups/${groupId}/subprojects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create sub-project');
    }
    const result = await response.json();
    return result.subproject;
  }

  async updateSubProject(groupId: string, subId: string, data: UpdateSubProjectDto): Promise<SubProject> {
    const response = await fetch(`/api/groups/${groupId}/subprojects/${subId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update sub-project');
    }
    const result = await response.json();
    return result.subproject;
  }

  async deleteSubProject(groupId: string, subId: string): Promise<void> {
    const response = await fetch(`/api/groups/${groupId}/subprojects/${subId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete sub-project');
    }
  }
}

export const projectService = new ProjectService();
