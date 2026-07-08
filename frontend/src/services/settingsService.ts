import type { Watch, WatchResult } from '../types';

export interface AppSettings {
  excluded_folders: string[];
  watches: Watch[];
}

export class SettingsService {
  async fetchSettings(): Promise<AppSettings> {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    return response.json();
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update settings');
    }
    const result = await response.json();
    return result.settings;
  }

  // --- Watch operations ---

  async addGlobalWatch(data: Omit<Watch, 'id'>): Promise<Watch> {
    const response = await fetch('/api/settings/watches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add watch');
    const result = await response.json();
    return result.watch;
  }

  async updateGlobalWatch(id: string, data: Partial<Watch>): Promise<void> {
    const response = await fetch(`/api/settings/watches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update watch');
  }

  async deleteGlobalWatch(id: string): Promise<void> {
    const response = await fetch(`/api/settings/watches/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete watch');
  }

  // --- Project watch operations ---

  async getProjectWatches(projectId: string): Promise<Watch[]> {
    const response = await fetch(`/api/projects/${projectId}/watches`);
    if (!response.ok) throw new Error('Failed to fetch project watches');
    return response.json();
  }

  async addProjectWatch(projectId: string, data: Omit<Watch, 'id'>): Promise<Watch> {
    const response = await fetch(`/api/projects/${projectId}/watches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add project watch');
    const result = await response.json();
    return result.watch;
  }

  async updateProjectWatch(projectId: string, watchId: string, data: Partial<Watch>): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}/watches/${watchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update project watch');
  }

  async deleteProjectWatch(projectId: string, watchId: string): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}/watches/${watchId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete project watch');
  }

  async getWatchedFiles(projectId: string): Promise<WatchResult[]> {
    const response = await fetch(`/api/projects/${projectId}/watched-files`);
    if (!response.ok) throw new Error('Failed to fetch watched files');
    const result = await response.json();
    return result.watches;
  }
}

export const settingsService = new SettingsService();
