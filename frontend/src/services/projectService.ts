import { invoke } from '@tauri-apps/api/core';
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
    // Ported to the Rust engine: reads ~/.fileviewer/projects.json.
    return invoke<ProjectGroup[]>('get_groups');
  }

  async createGroup(data: CreateGroupDto): Promise<ProjectGroup> {
    const result = await invoke<{ group: ProjectGroup }>('create_group', { title: data.title });
    return result.group;
  }

  async updateGroup(id: string, data: UpdateGroupDto): Promise<ProjectGroup> {
    const result = await invoke<{ group: ProjectGroup }>('update_group', { groupId: id, title: data.title });
    return result.group;
  }

  async deleteGroup(id: string): Promise<void> {
    await invoke('delete_group', { groupId: id });
  }

  // --- Sub-project operations ---

  async createSubProject(groupId: string, data: CreateSubProjectDto): Promise<SubProject> {
    const result = await invoke<{ subproject: SubProject }>('create_subproject', { groupId, data });
    return result.subproject;
  }

  async updateSubProject(groupId: string, subId: string, data: UpdateSubProjectDto): Promise<SubProject> {
    const result = await invoke<{ subproject: SubProject }>('update_subproject', {
      groupId,
      subId,
      updates: data,
    });
    return result.subproject;
  }

  async deleteSubProject(groupId: string, subId: string): Promise<void> {
    await invoke('delete_subproject', { groupId, subId });
  }
}

export const projectService = new ProjectService();
