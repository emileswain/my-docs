"""Main Flask application server."""

import json
import os
import socket
from pathlib import Path
from typing import Dict, List, Optional

from flask import Flask, jsonify, render_template, request

from .watcher import FolderWatcher
from .file_parser import FileParser

app = Flask(__name__)
app.config['watched_folders'] = []
app.config['watchers'] = {}
app.config['config_file'] = Path.home() / '.fileviewer' / 'watched_folders.json'


def find_free_port(start_port: int = 6060, max_attempts: int = 100) -> int:
    """Find a free port starting from start_port."""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except OSError:
            continue
    raise RuntimeError(f"Could not find a free port in range {start_port}-{start_port + max_attempts}")


def load_watched_folders() -> List[str]:
    """Load watched folders from config file."""
    config_file = app.config['config_file']
    if config_file.exists():
        with open(config_file, 'r') as f:
            return json.load(f)
    return []


def save_watched_folders(folders: List[str]) -> None:
    """Save watched folders to config file."""
    config_file = app.config['config_file']
    config_file.parent.mkdir(parents=True, exist_ok=True)
    with open(config_file, 'w') as f:
        json.dump(folders, f, indent=2)


@app.route('/')
def index():
    """Serve the main page."""
    return render_template('index.html')


@app.route('/api/folders', methods=['GET'])
def get_folders():
    """Get list of watched folders."""
    return jsonify(app.config['watched_folders'])


@app.route('/api/folders', methods=['POST'])
def add_folder():
    """Add a folder to watch."""
    data = request.json
    folder_path = data.get('path')

    if not folder_path:
        return jsonify({'error': 'No path provided'}), 400

    folder_path = os.path.abspath(os.path.expanduser(folder_path))

    if not os.path.isdir(folder_path):
        return jsonify({'error': 'Path is not a directory'}), 400

    if folder_path not in app.config['watched_folders']:
        app.config['watched_folders'].append(folder_path)
        save_watched_folders(app.config['watched_folders'])

        # Start watching the folder
        watcher = FolderWatcher(folder_path)
        app.config['watchers'][folder_path] = watcher
        watcher.start()

    return jsonify({'success': True, 'path': folder_path})


@app.route('/api/folders/<path:folder_path>', methods=['DELETE'])
def remove_folder(folder_path):
    """Remove a folder from watch list."""
    folder_path = '/' + folder_path

    if folder_path in app.config['watched_folders']:
        app.config['watched_folders'].remove(folder_path)
        save_watched_folders(app.config['watched_folders'])

        # Stop watching the folder
        if folder_path in app.config['watchers']:
            app.config['watchers'][folder_path].stop()
            del app.config['watchers'][folder_path]

        return jsonify({'success': True})

    return jsonify({'error': 'Folder not found'}), 404


@app.route('/api/browse/<path:folder_path>')
def browse_folder(folder_path):
    """Get directory structure for a folder."""
    folder_path = '/' + folder_path

    if folder_path not in app.config['watched_folders']:
        return jsonify({'error': 'Folder not being watched'}), 403

    try:
        items = []
        path_obj = Path(folder_path)

        for item in path_obj.iterdir():
            if item.is_file():
                # Only include supported file types
                if item.suffix.lower() in ['.md', '.json', '.yml', '.yaml']:
                    stat = item.stat()
                    items.append({
                        'name': item.name,
                        'path': str(item),
                        'type': 'file',
                        'extension': item.suffix.lower(),
                        'modified': stat.st_mtime,
                        'created': stat.st_birthtime if hasattr(stat, 'st_birthtime') else stat.st_ctime,
                    })
            elif item.is_dir() and not item.name.startswith('.'):
                items.append({
                    'name': item.name,
                    'path': str(item),
                    'type': 'folder',
                })

        # Sort: folders alphabetically, then files by creation date (newest first)
        folders = sorted([i for i in items if i['type'] == 'folder'], key=lambda x: x['name'].lower())
        files = sorted([i for i in items if i['type'] == 'file'], key=lambda x: x['created'], reverse=True)

        return jsonify({'items': folders + files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/file/<path:file_path>')
def get_file_tree(file_path):
    """Get tree structure of a file's contents."""
    file_path = '/' + file_path

    # Check if file is in a watched folder
    is_watched = any(file_path.startswith(watched) for watched in app.config['watched_folders'])
    if not is_watched:
        return jsonify({'error': 'File not in watched folder'}), 403

    try:
        parser = FileParser(file_path)
        tree = parser.parse()
        return jsonify({'tree': tree, 'content': parser.get_raw_content()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def main():
    """Main entry point."""
    # Load watched folders
    app.config['watched_folders'] = load_watched_folders()

    # Start watchers for existing folders
    for folder in app.config['watched_folders']:
        if os.path.isdir(folder):
            watcher = FolderWatcher(folder)
            app.config['watchers'][folder] = watcher
            watcher.start()

    # Find free port
    port = find_free_port()

    print(f"Starting File Viewer on http://localhost:{port}")
    print(f"Watching {len(app.config['watched_folders'])} folders")

    try:
        app.run(host='0.0.0.0', port=port, debug=True, use_reloader=True)
    finally:
        # Stop all watchers
        for watcher in app.config['watchers'].values():
            watcher.stop()


if __name__ == '__main__':
    main()
