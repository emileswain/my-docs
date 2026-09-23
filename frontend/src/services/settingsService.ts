import { invoke } from '@tauri-apps/api/core';
import type { Watch, WatchResult, FileItem } from '../types';

export interface AppSettings {
  excluded_folders: string[];
  watches: Watch[];
}

export class SettingsService {
  async fetchSettings(): Promise<AppSettings> {
    // Ported to the Rust engine: reads ~/.fileviewer/settings.json.
    return invoke<AppSettings>('get_settings');
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

  async refreshWatchScript(projectId: string, watchId: string): Promise<{ pattern: string }> {
    const response = await fetch(`/api/projects/${projectId}/watches/${watchId}/refresh`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to refresh watch');
    }
    return response.json();
  }

  async getWatchedFiles(projectId: string): Promise<WatchResult[]> {
    // Ported to the Rust engine (stub returns []; watch/glob resolution TODO).
    const result = await invoke<{ watches: WatchResult[] }>('get_watched_files', { projectId });
    return result.watches;
  }

  // --- Favourites operations (ported to the Rust engine) ---

  async getFavourites(): Promise<string[]> {
    const result = await invoke<{ favourites: string[] }>('get_favourites');
    return result.favourites;
  }

  async addFavourite(path: string): Promise<string[]> {
    const result = await invoke<{ favourites: string[] }>('add_favourite', { path });
    return result.favourites;
  }

  async removeFavourite(path: string): Promise<string[]> {
    const result = await invoke<{ favourites: string[] }>('remove_favourite', { path });
    return result.favourites;
  }

  async getFavouriteFiles(projectId: string): Promise<FileItem[]> {
    const result = await invoke<{ files: FileItem[] }>('get_favourite_files', { projectId });
    return result.files;
  }
}

export const settingsService = new SettingsService();
