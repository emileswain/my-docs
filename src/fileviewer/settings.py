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
