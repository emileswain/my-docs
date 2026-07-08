export interface AppSettings {
  excluded_folders: string[];
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
}

export const settingsService = new SettingsService();
