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

  // Global watch operations (ported to the Rust engine).
  async getGlobalWatches(): Promise<Watch[]> {
    return invoke<Watch[]>('get_global_watches');
  }

  async addGlobalWatch(data: Omit<Watch, 'id'>): Promise<Watch> {
    const result = await invoke<{ watch: Watch }>('add_global_watch', { watch: data });
    return result.watch;
  }

  async updateGlobalWatch(id: string, data: Partial<Watch>): Promise<void> {
    await invoke('update_global_watch', { watchId: id, updates: data });
  }

  async deleteGlobalWatch(id: string): Promise<void> {
    await invoke('delete_global_watch', { watchId: id });
  }

  // --- Project watch operations ---

  async getProjectWatches(projectId: string): Promise<Watch[]> {
    // Resolved active watches (global + project), ported to the Rust engine.
    return invoke<Watch[]>('get_project_watches', { projectId });
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

  // The current git branch's issue number for a project (or null). Used by the
  // branch-issue watch filter.
  async getBranchIssue(projectId: string): Promise<string | null> {
    return invoke<string | null>('get_branch_issue', { projectId });
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
