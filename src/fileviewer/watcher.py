"""File system watcher for monitoring folder changes."""

import threading
from pathlib import Path
from typing import Callable, Optional

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent


class FolderEventHandler(FileSystemEventHandler):
    """Handler for file system events."""

    def __init__(self, callback: Optional[Callable] = None):
        """Initialize the event handler.

        Args:
            callback: Optional callback function to call on file changes
        """
        self.callback = callback
        super().__init__()

    def on_any_event(self, event: FileSystemEvent):
        """Handle any file system event.

        Args:
            event: The file system event
        """
        if event.is_directory:
            return

        # Only process supported file types
        if event.src_path.endswith(('.md', '.json', '.yml', '.yaml')):
            print(f"File change detected: {event.event_type} - {event.src_path}")
            if self.callback:
                self.callback(event)


class FolderWatcher:
    """Watches a folder for file changes."""

    def __init__(self, folder_path: str, callback: Optional[Callable] = None):
        """Initialize the folder watcher.

        Args:
            folder_path: Path to the folder to watch
            callback: Optional callback function to call on file changes
        """
        self.folder_path = Path(folder_path)
        self.callback = callback
        self.observer = Observer()
        self.event_handler = FolderEventHandler(callback)
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
        """Check if the watcher is running.

        Returns:
            True if the watcher is running, False otherwise
        """
        return self._running
