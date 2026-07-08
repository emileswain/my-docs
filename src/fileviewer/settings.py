"""Application settings management."""

import json
from pathlib import Path
from typing import Any, Dict, List


DEFAULT_SETTINGS = {
    'excluded_folders': [
        'node_modules', '.git', '__pycache__', '.venv', 'venv',
        'dist', 'build', '.next', '.nuxt', 'target', 'out',
        '.gradle', '.idea', '.vscode', 'coverage', '.cache',
        '.parcel-cache', '.turbo', 'obj', 'bin',
    ],
    'watches': [],
}


class SettingsManager:
    """Manages application settings persisted to disk."""

    def __init__(self, config_dir: Path):
        self.config_file = config_dir / 'settings.json'
        self.settings: Dict[str, Any] = {}
        self.load()

    def load(self) -> None:
        if self.config_file.exists():
            with open(self.config_file, 'r') as f:
                self.settings = json.load(f)

        # Fill in any missing defaults
        for key, default in DEFAULT_SETTINGS.items():
            if key not in self.settings:
                self.settings[key] = default

    def save(self) -> None:
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.config_file, 'w') as f:
            json.dump(self.settings, f, indent=2)

    def get(self, key: str) -> Any:
        return self.settings.get(key, DEFAULT_SETTINGS.get(key))

    def set(self, key: str, value: Any) -> None:
        self.settings[key] = value
        self.save()

    def get_all(self) -> Dict[str, Any]:
        return dict(self.settings)

    def update(self, updates: Dict[str, Any]) -> None:
        self.settings.update(updates)
        self.save()

    def get_excluded_folders(self) -> List[str]:
        return self.get('excluded_folders') or []

    def get_excluded_folders_set(self) -> set:
        return set(self.get_excluded_folders())

    def get_watches(self) -> List[Dict]:
        return self.get('watches') or []

    def add_watch(self, watch: Dict) -> Dict:
        watches = self.get_watches()
        watches.append(watch)
        self.set('watches', watches)
        return watch

    def update_watch(self, watch_id: str, updates: Dict) -> bool:
        watches = self.get_watches()
        for w in watches:
            if w.get('id') == watch_id:
                w.update(updates)
                self.set('watches', watches)
                return True
        return False

    def remove_watch(self, watch_id: str) -> bool:
        watches = self.get_watches()
        filtered = [w for w in watches if w.get('id') != watch_id]
        if len(filtered) < len(watches):
            self.set('watches', filtered)
            return True
        return False
