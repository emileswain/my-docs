import { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';
import type { AppSettings } from '../../services/settingsService';
import { WatchEditor } from './WatchEditor';

export function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [newFolder, setNewFolder] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    settingsService.fetchSettings()
      .then(setSettings)
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveExcludedFolders = async (folders: string[]) => {
    setSaving(true);
    try {
      const updated = await settingsService.updateSettings({ excluded_folders: folders });
      setSettings(updated);
      showMessage('Settings saved. Watchers restarted.', 'success');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addFolder = () => {
    const name = newFolder.trim();
    if (!name || !settings) return;
    if (settings.excluded_folders.includes(name)) {
      showMessage(`"${name}" is already in the list`, 'error');
      return;
    }
    const updated = [...settings.excluded_folders, name].sort();
    setSettings({ ...settings, excluded_folders: updated });
    setNewFolder('');
    saveExcludedFolders(updated);
  };

  const removeFolder = (folder: string) => {
    if (!settings) return;
    const updated = settings.excluded_folders.filter(f => f !== folder);
    setSettings({ ...settings, excluded_folders: updated });
    saveExcludedFolders(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFolder();
    }
  };

  if (!settings) {
    return (
      <div className="p-8">
        <p style={{ color: 'var(--text-tertiary)' }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Settings</h2>

      {/* Status message */}
      {message && (
        <div
          className="mb-4 px-4 py-2 rounded-md text-sm"
          style={{
            backgroundColor: message.type === 'success' ? 'var(--accent-secondary)' : 'var(--color-red-50)',
            color: message.type === 'success' ? 'var(--accent-primary)' : 'var(--color-red-600)',
            border: `1px solid ${message.type === 'success' ? 'var(--accent-primary)' : 'var(--color-red-600)'}`,
          }}
        >
          <i className={`fas fa-${message.type === 'success' ? 'check' : 'exclamation-triangle'} mr-2`}></i>
          {message.text}
        </div>
      )}

      {/* Excluded Folders */}
      <div
        className="rounded-lg p-6"
        style={{
          backgroundColor: 'var(--surface-panel)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            Excluded Folders
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Folders matching these names will be ignored by file watchers and hidden from the file tree.
            Changes take effect immediately (watchers are restarted).
          </p>
        </div>

        {/* Add new folder */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., .build, cmake-build-debug"
            className="flex-1 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2"
            style={{
              border: '1px solid var(--border-primary)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-focus)',
            }}
          />
          <button
            onClick={addFolder}
            disabled={saving || !newFolder.trim()}
            className="px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2"
            style={{
              backgroundColor: newFolder.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: newFolder.trim() ? 'white' : 'var(--text-tertiary)',
            }}
          >
            <i className="fas fa-plus mr-1"></i>
            Add
          </button>
        </div>

        {/* Folder list */}
        <div className="flex flex-wrap gap-2">
          {settings.excluded_folders.map((folder) => (
            <span
              key={folder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-secondary)',
              }}
            >
              <code className="text-xs">{folder}</code>
              <button
                onClick={() => removeFolder(folder)}
                className="ml-1 rounded-full hover:bg-opacity-20"
                style={{ color: 'var(--text-tertiary)' }}
                title={`Remove ${folder}`}
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </span>
          ))}
        </div>

        {settings.excluded_folders.length === 0 && (
          <p className="text-sm italic mt-2" style={{ color: 'var(--text-tertiary)' }}>
            No excluded folders. All folders will be watched and browsable.
          </p>
        )}
      </div>

      {/* Global Watches */}
      <div className="mt-6">
        <WatchEditor
          watches={settings.watches || []}
          label="Global Watches"
          description="Watches defined here apply to all projects by default. Projects can override or disable individual watches. Files matching a watch appear at the top of the file tree."
          onAdd={async (data) => {
            try {
              const watch = await settingsService.addGlobalWatch(data);
              setSettings({ ...settings, watches: [...(settings.watches || []), watch] });
              showMessage('Watch added', 'success');
            } catch (err) {
              showMessage(err instanceof Error ? err.message : 'Failed to add watch', 'error');
            }
          }}
          onUpdate={async (id, updates) => {
            try {
              await settingsService.updateGlobalWatch(id, updates);
              setSettings({
                ...settings,
                watches: (settings.watches || []).map(w =>
                  w.id === id ? { ...w, ...updates } : w
                ),
              });
              showMessage('Watch updated', 'success');
            } catch (err) {
              showMessage(err instanceof Error ? err.message : 'Failed to update watch', 'error');
            }
          }}
          onDelete={async (id) => {
            try {
              await settingsService.deleteGlobalWatch(id);
              setSettings({
                ...settings,
                watches: (settings.watches || []).filter(w => w.id !== id),
              });
              showMessage('Watch deleted', 'success');
            } catch (err) {
              showMessage(err instanceof Error ? err.message : 'Failed to delete watch', 'error');
            }
          }}
        />
      </div>
    </div>
  );
}
