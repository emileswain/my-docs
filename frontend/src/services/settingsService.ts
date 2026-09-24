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

  // The project's own (editable) watches. Ported to the Rust engine.
  async listProjectWatches(projectId: string): Promise<Watch[]> {
    return invoke<Watch[]>('list_project_watches', { projectId });
  }

  async addProjectWatch(projectId: string, data: Omit<Watch, 'id'>): Promise<Watch> {
    const result = await invoke<{ watch: Watch }>('add_project_watch', { projectId, watch: data });
    return result.watch;
  }

  async updateProjectWatch(projectId: string, watchId: string, data: Partial<Watch>): Promise<void> {
    await invoke('update_project_watch', { projectId, watchId, updates: data });
  }

  async deleteProjectWatch(projectId: string, watchId: string): Promise<void> {
    await invoke('delete_project_watch', { projectId, watchId });
  }

  async refreshWatchScript(projectId: string, watchId: string): Promise<{ pattern: string }> {
    // Runs the watch's script in the project dir; returns applied fields.
    return invoke<{ pattern: string }>('refresh_watch_script', { projectId, watchId });
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
