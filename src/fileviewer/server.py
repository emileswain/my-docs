"""Main Flask application server."""

import os
import socket
import json
import queue
from pathlib import Path

import markdown
from flask import Flask, jsonify, send_from_directory, Response, stream_with_context
from flask_cors import CORS

from .watcher import FolderWatcher
from .file_parser import FileParser
from .project import ProjectManager

app = Flask(__name__)
CORS(app)  # Enable CORS for development
app.config['project_manager'] = None
app.config['watchers'] = {}
app.config['config_file'] = Path.home() / '.fileviewer' / 'projects.json'
app.config['change_queues'] = []  # List of queues for SSE clients


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


def broadcast_change(event_type: str, path: str, project_id: str):
    """Broadcast a file change event to all connected SSE clients."""
    message = {
        'type': event_type,
        'path': path,
        'project_id': project_id
    }

    # Send to all connected clients
    dead_queues = []
    for q in app.config['change_queues']:
        try:
            q.put_nowait(message)
        except queue.Full:
            dead_queues.append(q)

    # Remove dead queues
    for q in dead_queues:
        app.config['change_queues'].remove(q)




@app.route('/')
def index():
    """Serve the React frontend or redirect to dev server."""
    from flask import redirect

    # Check if we're in development mode
    is_dev = os.environ.get('FLASK_ENV') != 'production'

    if is_dev:
        # In development, redirect to Vite dev server
        return redirect('http://localhost:3030')

    # In production, serve the built frontend
    dist_dir = Path(__file__).parent.parent.parent / 'frontend' / 'dist'
    if dist_dir.exists():
        return send_from_directory(dist_dir, 'index.html')
    return jsonify({'error': 'Frontend not built. Run: cd frontend && npm run build'}), 500


@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Get list of all projects."""
    pm = app.config['project_manager']
    projects = [p.to_dict() for p in pm.get_all_projects()]
    return jsonify(projects)


@app.route('/api/projects', methods=['POST'])
def add_project():
    """Add a new project."""
    from flask import request
    data = request.json
    folder_path = data.get('path')
    title = data.get('title')
    description = data.get('description', '')

    if not folder_path:
        return jsonify({'error': 'No path provided'}), 400

    folder_path = os.path.abspath(os.path.expanduser(folder_path))

    if not os.path.isdir(folder_path):
        return jsonify({'error': 'Path is not a directory'}), 400

    pm = app.config['project_manager']
    project = pm.add_project(folder_path, title, description)

    # Start watching the folder with callback
    def on_change(event):
        broadcast_change(event.event_type, event.src_path, project.project_id)

    watcher = FolderWatcher(folder_path, callback=on_change)
    app.config['watchers'][project.project_id] = watcher
    watcher.start()

    return jsonify({'success': True, 'project': project.to_dict()})


@app.route('/api/projects/<project_id>', methods=['PUT'])
def update_project(project_id):
    """Update a project."""
    data = request.json
    pm = app.config['project_manager']

    project = pm.update_project(
        project_id,
        title=data.get('title'),
        description=data.get('description'),
        path=data.get('path')
    )

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    return jsonify({'success': True, 'project': project.to_dict()})


@app.route('/api/projects/<project_id>', methods=['DELETE'])
def remove_project(project_id):
    """Remove a project."""
    pm = app.config['project_manager']

    if pm.remove_project(project_id):
        # Stop watching the folder
        if project_id in app.config['watchers']:
            app.config['watchers'][project_id].stop()
            del app.config['watchers'][project_id]

        return jsonify({'success': True})

    return jsonify({'error': 'Project not found'}), 404


@app.route('/api/projects/<project_identifier>/browse-all')
def browse_all_folders(project_identifier):
    """Recursively get entire directory structure for a project."""
    pm = app.config['project_manager']

    # Try to get project by ID or slug
    project = pm.get_project(project_identifier)
    if not project:
        project = pm.get_project_by_slug(project_identifier)

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    root_path = Path(project.path)
    excluded_folders = {'node_modules', '.git', '__pycache__', '.venv', 'venv', 'dist', 'build'}

    try:
        cache = {}

        def scan_folder(folder_path: Path):
            """Recursively scan a folder and its subfolders."""
            items = []

            try:
                for item in folder_path.iterdir():
                    # Skip excluded folders
                    if item.is_dir() and item.name in excluded_folders:
                        continue

                    if item.is_file():
                        # Only include supported file types
                        if item.suffix.lower() in ['.md', '.json', '.yml', '.yaml', '.mmd']:
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
                        # Recursively scan subfolder
                        scan_folder(item)
            except (PermissionError, OSError) as e:
                print(f"Warning: Could not access {folder_path}: {e}")

            # Sort: folders alphabetically, then files by creation date (newest first)
            folders = sorted([i for i in items if i['type'] == 'folder'], key=lambda x: x['name'].lower())
            files = sorted([i for i in items if i['type'] == 'file'], key=lambda x: x['created'], reverse=True)

            cache[str(folder_path)] = folders + files

        # Start recursive scan from root
        scan_folder(root_path)

        return jsonify({
            'cache': cache,
            'rootItems': cache.get(str(root_path), [])
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/projects/<project_identifier>/browse')
@app.route('/api/projects/<project_identifier>/browse/<path:subpath>')
def browse_project(project_identifier, subpath=''):
    """Get directory structure for a project."""
    pm = app.config['project_manager']

    # Try to get project by ID or slug
    project = pm.get_project(project_identifier)
    if not project:
        project = pm.get_project_by_slug(project_identifier)

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    folder_path = Path(project.path) / subpath if subpath else Path(project.path)

    try:
        items = []

        for item in folder_path.iterdir():
            if item.is_file():
                # Only include supported file types
                if item.suffix.lower() in ['.md', '.json', '.yml', '.yaml', '.mmd']:
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


@app.route('/api/events')
def stream_events():
    """Server-Sent Events endpoint for file change notifications."""
    def event_stream():
        q = queue.Queue(maxsize=10)
        app.config['change_queues'].append(q)

        try:
            while True:
                try:
                    message = q.get(timeout=30)  # 30 second timeout for heartbeat
                    yield f"data: {json.dumps(message)}\n\n"
                except queue.Empty:
                    # Send heartbeat
                    yield f": heartbeat\n\n"
        finally:
            if q in app.config['change_queues']:
                app.config['change_queues'].remove(q)

    return Response(
        stream_with_context(event_stream()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no'
        }
    )


@app.route('/api/file/<path:file_path>')
def get_file_tree(file_path):
    """Get tree structure of a file's contents."""
    file_path = '/' + file_path

    # Check if file is in a watched project
    pm = app.config['project_manager']
    is_watched = any(
        file_path.startswith(project.path)
        for project in pm.get_all_projects()
    )
    if not is_watched:
        return jsonify({'error': 'File not in watched project'}), 403

    try:
        parser = FileParser(file_path)
        tree = parser.parse()
        content = parser.get_raw_content()

        # Convert markdown to HTML if it's a markdown file
        html_content = None
        if file_path.endswith('.md'):
            md = markdown.Markdown(extensions=['fenced_code', 'tables'])
            html_content = md.convert(content)

        return jsonify({
            'tree': tree,
            'content': content,
            'html': html_content,
            'type': Path(file_path).suffix.lower()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def main():
    """Main entry point."""
    # Initialize project manager
    config_file = app.config['config_file']

    # Check for old format and migrate
    old_config = Path.home() / '.fileviewer' / 'watched_folders.json'
    if old_config.exists() and not config_file.exists():
        # Migrate old config to new location
        config_file.parent.mkdir(parents=True, exist_ok=True)
        old_config.rename(config_file)

    pm = ProjectManager(config_file)
    app.config['project_manager'] = pm

    # Start watchers for existing projects
    for project in pm.get_all_projects():
        if os.path.isdir(project.path):
            # Create callback for this project
            def make_callback(proj_id):
                def on_change(event):
                    broadcast_change(event.event_type, event.src_path, proj_id)
                return on_change

            watcher = FolderWatcher(project.path, callback=make_callback(project.project_id))
            app.config['watchers'][project.project_id] = watcher
            watcher.start()

    # Find free port
    port = find_free_port()

    # Check if running in production mode
    is_production = os.environ.get('FLASK_ENV') == 'production'
    debug_mode = not is_production

    print(f"Starting File Viewer on http://localhost:{port}")
    print(f"Mode: {'Production' if is_production else 'Development'}")
    print(f"Watching {len(pm.get_all_projects())} projects")

    try:
        app.run(host='0.0.0.0', port=port, debug=debug_mode, use_reloader=debug_mode)
    finally:
        # Stop all watchers
        for watcher in app.config['watchers'].values():
            watcher.stop()


if __name__ == '__main__':
    main()
