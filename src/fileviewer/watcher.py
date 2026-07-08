"""File system watcher for monitoring folder changes."""

from pathlib import Path
from typing import Callable, Optional, Set

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent


class FolderEventHandler(FileSystemEventHandler):
    """Handler for file system events."""

    def __init__(self, callback: Optional[Callable] = None, excluded_folders: Optional[Set[str]] = None):
        self.callback = callback
        self.excluded_folders = excluded_folders or set()
        super().__init__()

    def _is_excluded(self, path: str) -> bool:
        """Check if a path contains an excluded folder."""
        parts = Path(path).parts
        return any(part in self.excluded_folders for part in parts)

    def on_any_event(self, event: FileSystemEvent):
        # Skip events in excluded folders
        if self._is_excluded(event.src_path):
            return

        is_relevant = False

        if event.is_directory:
            is_relevant = True
        else:
            is_relevant = event.src_path.endswith(('.md', '.json', '.yml', '.yaml', '.mmd', '.xml'))

        if is_relevant:
            print(f"{'Folder' if event.is_directory else 'File'} change detected: {event.event_type} - {event.src_path}")
            if self.callback:
                self.callback(event)


class FolderWatcher:
    """Watches a folder for file changes."""

    def __init__(self, folder_path: str, callback: Optional[Callable] = None, excluded_folders: Optional[Set[str]] = None):
        self.folder_path = Path(folder_path)
        self.callback = callback
        self.observer = Observer()
        self.event_handler = FolderEventHandler(callback, excluded_folders)
        self._running = False

    def start(self):
        """Start watching the folder."""
        if not self._running:
            self.observer.schedule(
                self.event_handler,
                str(self.folder_path),
                recursive=True
            )
            self.observer.start()
            self._running = True
            print(f"Started watching: {self.folder_path}")

    def stop(self):
        """Stop watching the folder."""
        if self._running:
            self.observer.stop()
            self.observer.join()
            self._running = False
            print(f"Stopped watching: {self.folder_path}")

    def is_running(self) -> bool:
        return self._running
