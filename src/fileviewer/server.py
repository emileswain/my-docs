"""Main Flask application server."""

import os
import socket
import json
import queue
from pathlib import Path

import markdown
from flask import Flask, jsonify, request, send_from_directory, Response, stream_with_context
from flask_cors import CORS

from .watcher import FolderWatcher
from .file_parser import FileParser
from .project import ProjectManager
from .settings import SettingsManager

app = Flask(__name__)
CORS(app)  # Enable CORS for development
app.config['project_manager'] = None
app.config['settings_manager'] = None
app.config['watchers'] = {}
app.config['config_file'] = Path.home() / '.fileviewer' / 'projects.json'
app.config['config_dir'] = Path.home() / '.fileviewer'
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

    dead_queues = []
    for q in app.config['change_queues']:
        try:
            q.put_nowait(message)
        except queue.Full:
            dead_queues.append(q)

    for q in dead_queues:
        app.config['change_queues'].remove(q)


def start_watcher_for_project(project):
    """Start a file watcher for a project if the path exists."""
    if not os.path.isdir(project.path):
        return

    def make_callback(proj_id):
        def on_change(event):
            broadcast_change(event.event_type, event.src_path, proj_id)
        return on_change

    sm = app.config['settings_manager']
    excluded = sm.get_excluded_folders_set() if sm else set()
    watcher = FolderWatcher(project.path, callback=make_callback(project.project_id), excluded_folders=excluded)
    app.config['watchers'][project.project_id] = watcher
    watcher.start()


@app.route('/')
def index():
    """Serve the React frontend or redirect to dev server."""
    from flask import redirect

    is_dev = os.environ.get('FLASK_ENV') != 'production'

    if is_dev:
        return redirect('http://localhost:3030')

    dist_dir = Path(__file__).parent.parent.parent / 'frontend' / 'dist'
    if dist_dir.exists():
        return send_from_directory(dist_dir, 'index.html')
    return jsonify({'error': 'Frontend not built. Run: cd frontend && npm run build'}), 500


# --- Group endpoints ---

@app.route('/api/groups', methods=['GET'])
def get_groups():
    """Get all groups with their sub-projects."""
    pm = app.config['project_manager']
    groups = [g.to_dict() for g in pm.get_all_groups()]
    return jsonify(groups)


@app.route('/api/groups', methods=['POST'])
def create_group():
    """Create a new group."""
    data = request.json
    title = data.get('title')

    if not title:
        return jsonify({'error': 'Title is required'}), 400

    pm = app.config['project_manager']
    group = pm.add_group(title)
    return jsonify({'success': True, 'group': group.to_dict()})


@app.route('/api/groups/<group_id>', methods=['PUT'])
def update_group(group_id):
    """Update a group."""
    data = request.json
    pm = app.config['project_manager']

    group = pm.update_group(group_id, title=data.get('title'))
    if not group:
        return jsonify({'error': 'Group not found'}), 404

    return jsonify({'success': True, 'group': group.to_dict()})


@app.route('/api/groups/<group_id>', methods=['DELETE'])
def delete_group(group_id):
    """Delete a group and all its sub-projects."""
    pm = app.config['project_manager']
    group = pm.get_group(group_id)

    if not group:
        return jsonify({'error': 'Group not found'}), 404

    # Stop watchers for all sub-projects in group
    for sp in group.subprojects:
        if sp.project_id in app.config['watchers']:
            app.config['watchers'][sp.project_id].stop()
            del app.config['watchers'][sp.project_id]

    pm.remove_group(group_id)
    return jsonify({'success': True})


# --- Sub-project endpoints ---

@app.route('/api/groups/<group_id>/subprojects', methods=['POST'])
def create_subproject(group_id):
    """Add a sub-project to a group."""
    data = request.json
    folder_path = data.get('path')
    title = data.get('title')
    description = data.get('description', '')
    project_type = data.get('type', 'web')

    if not folder_path:
        return jsonify({'error': 'No path provided'}), 400

    folder_path = os.path.abspath(os.path.expanduser(folder_path))

    if not os.path.isdir(folder_path):
        return jsonify({'error': 'Path is not a directory'}), 400

    pm = app.config['project_manager']
    project = pm.add_subproject(group_id, folder_path, title, description, project_type)

    if not project:
        return jsonify({'error': 'Group not found'}), 404

    start_watcher_for_project(project)

    return jsonify({'success': True, 'subproject': project.to_dict()})


@app.route('/api/groups/<group_id>/subprojects/<sub_id>', methods=['PUT'])
def update_subproject(group_id, sub_id):
    """Update a sub-project."""
    data = request.json
    pm = app.config['project_manager']

    path = data.get('path')
    if path:
        path = os.path.abspath(os.path.expanduser(path))

    project = pm.update_subproject(
        group_id,
        sub_id,
        title=data.get('title'),
        description=data.get('description'),
        path=path,
        project_type=data.get('type'),
    )

    if not project:
        return jsonify({'error': 'Group or sub-project not found'}), 404

    return jsonify({'success': True, 'subproject': project.to_dict()})


@app.route('/api/groups/<group_id>/subprojects/<sub_id>', methods=['DELETE'])
def delete_subproject(group_id, sub_id):
    """Delete a sub-project."""
    pm = app.config['project_manager']

    if pm.remove_subproject(group_id, sub_id):
        if sub_id in app.config['watchers']:
            app.config['watchers'][sub_id].stop()
            del app.config['watchers'][sub_id]
        return jsonify({'success': True})

    return jsonify({'error': 'Group or sub-project not found'}), 404


# --- Settings endpoints ---

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get all settings."""
    sm = app.config['settings_manager']
    return jsonify(sm.get_all())


@app.route('/api/settings', methods=['PUT'])
def update_settings():
    """Update settings."""
    data = request.json
    sm = app.config['settings_manager']
    sm.update(data)

    # If excluded folders changed, restart all watchers
    if 'excluded_folders' in data:
        restart_all_watchers()

    return jsonify({'success': True, 'settings': sm.get_all()})


def restart_all_watchers():
    """Restart all file watchers with current settings."""
    pm = app.config['project_manager']

    # Stop all existing watchers
    for watcher in app.config['watchers'].values():
        watcher.stop()
    app.config['watchers'].clear()

    # Restart with updated excluded folders
    for project in pm.get_all_projects():
        start_watcher_for_project(project)


# --- Backward-compatible project endpoints ---

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Get flat list of all sub-projects (backward compat)."""
    pm = app.config['project_manager']
    projects = []
    for group in pm.get_all_groups():
        for sp in group.subprojects:
            d = sp.to_dict()
            d['groupId'] = group.group_id
            projects.append(d)
    return jsonify(projects)


@app.route('/api/projects', methods=['POST'])
def add_project():
    """Add a new project (backward compat - adds to first group or creates one)."""
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

    # Add to first group, or create a default one
    groups = pm.get_all_groups()
    if groups:
        group = groups[0]
    else:
        group = pm.add_group('Projects')

    project = pm.add_subproject(group.group_id, folder_path, title, description)
    start_watcher_for_project(project)

    return jsonify({'success': True, 'project': project.to_dict()})


@app.route('/api/projects/<project_id>', methods=['PUT'])
def update_project(project_id):
    """Update a project (backward compat)."""
    data = request.json
    pm = app.config['project_manager']

    group = pm.get_group_for_project(project_id)
    if not group:
        return jsonify({'error': 'Project not found'}), 404

    path = data.get('path')
    if path:
        path = os.path.abspath(os.path.expanduser(path))

    project = pm.update_subproject(
        group.group_id,
        project_id,
        title=data.get('title'),
        description=data.get('description'),
        path=path,
    )

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    return jsonify({'success': True, 'project': project.to_dict()})


@app.route('/api/projects/<project_id>', methods=['DELETE'])
def remove_project(project_id):
    """Remove a project (backward compat)."""
    pm = app.config['project_manager']

    group = pm.get_group_for_project(project_id)
    if not group:
        return jsonify({'error': 'Project not found'}), 404

    if pm.remove_subproject(group.group_id, project_id):
        if project_id in app.config['watchers']:
            app.config['watchers'][project_id].stop()
            del app.config['watchers'][project_id]
        return jsonify({'success': True})

    return jsonify({'error': 'Project not found'}), 404


# --- Browse endpoints ---

@app.route('/api/projects/<project_identifier>/browse-all')
def browse_all_folders(project_identifier):
    """Recursively get entire directory structure for a project."""
    pm = app.config['project_manager']

    project = pm.get_project(project_identifier)
    if not project:
        project = pm.get_project_by_slug(project_identifier)

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    root_path = Path(project.path)
    sm = app.config['settings_manager']
    excluded_folders = sm.get_excluded_folders_set() if sm else set()

    try:
        cache = {}

        def scan_folder(folder_path: Path):
            items = []
            try:
                for item in folder_path.iterdir():
                    if item.is_dir() and item.name in excluded_folders:
                        continue

                    if item.is_file():
                        if item.suffix.lower() in ['.md', '.json', '.yml', '.yaml', '.mmd', '.xml']:
                            stat = item.stat()
                            items.append({
                                'name': item.name,
                                'path': str(item),
                                'type': 'file',
                                'extension': item.suffix.lower(),
                                'modified': stat.st_mtime,
                                'created': stat.st_birthtime if hasattr(stat, 'st_birthtime') else stat.st_ctime,
                            })
                    elif item.is_dir():
                        items.append({
                            'name': item.name,
                            'path': str(item),
                            'type': 'folder',
                        })
                        scan_folder(item)
            except (PermissionError, OSError) as e:
                print(f"Warning: Could not access {folder_path}: {e}")

            folders = sorted([i for i in items if i['type'] == 'folder'], key=lambda x: x['name'].lower())
            files = sorted([i for i in items if i['type'] == 'file'], key=lambda x: x['created'], reverse=True)
            cache[str(folder_path)] = folders + files

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

    project = pm.get_project(project_identifier)
    if not project:
        project = pm.get_project_by_slug(project_identifier)

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    folder_path = Path(project.path) / subpath if subpath else Path(project.path)
    sm = app.config['settings_manager']
    excluded_folders = sm.get_excluded_folders_set() if sm else set()

    try:
        items = []

        for item in folder_path.iterdir():
            if item.is_dir() and item.name in excluded_folders:
                continue
            if item.is_file():
                if item.suffix.lower() in ['.md', '.json', '.yml', '.yaml', '.mmd', '.xml']:
                    stat = item.stat()
                    items.append({
                        'name': item.name,
                        'path': str(item),
                        'type': 'file',
                        'extension': item.suffix.lower(),
                        'modified': stat.st_mtime,
                        'created': stat.st_birthtime if hasattr(stat, 'st_birthtime') else stat.st_ctime,
                    })
            elif item.is_dir():
                items.append({
                    'name': item.name,
                    'path': str(item),
                    'type': 'folder',
                })

        folders = sorted([i for i in items if i['type'] == 'folder'], key=lambda x: x['name'].lower())
        files = sorted([i for i in items if i['type'] == 'file'], key=lambda x: x['created'], reverse=True)

        return jsonify({'items': folders + files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- SSE and file endpoints ---

@app.route('/api/events')
def stream_events():
    """Server-Sent Events endpoint for file change notifications."""
    def event_stream():
        q = queue.Queue(maxsize=10)
        app.config['change_queues'].append(q)

        try:
            while True:
                try:
                    message = q.get(timeout=30)
                    yield f"data: {json.dumps(message)}\n\n"
                except queue.Empty:
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


@app.route('/api/file/<path:file_path>', methods=['GET'])
def get_file_tree(file_path):
    """Get tree structure of a file's contents."""
    file_path = '/' + file_path

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

        html_content = None
        if file_path.endswith('.md'):
            md = markdown.Markdown(extensions=['fenced_code', 'tables'])
            html_content = md.convert(content)

        junit_data = None
        if file_path.endswith('.xml'):
            try:
                import xml.etree.ElementTree as ET
                root = ET.fromstring(content)
                if root.tag in ('testsuites', 'testsuite'):
                    junit_data = parser.parse_junit_xml(content)
            except ET.ParseError:
                pass

        return jsonify({
            'tree': tree,
            'content': content,
            'html': html_content,
            'junit': junit_data,
            'type': Path(file_path).suffix.lower()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/file/<path:file_path>', methods=['PUT'])
def save_file(file_path):
    """Save file content."""
    file_path = '/' + file_path

    pm = app.config['project_manager']
    project_id = None
    for project in pm.get_all_projects():
        if file_path.startswith(project.path):
            project_id = project.project_id
            break

    if not project_id:
        return jsonify({'error': 'File not in watched project'}), 403

    try:
        data = request.json
        content = data.get('content')

        if content is None:
            return jsonify({'error': 'No content provided'}), 400

        file_obj = Path(file_path)
        if not file_obj.exists():
            return jsonify({'error': 'File does not exist'}), 404

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        broadcast_change('modified', file_path, project_id)

        return jsonify({
            'success': True,
            'message': 'File saved successfully'
        })
    except PermissionError:
        return jsonify({'error': 'Permission denied writing to file'}), 403
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def main():
    """Main entry point."""
    config_file = app.config['config_file']

    # Check for old format and migrate
    old_config = Path.home() / '.fileviewer' / 'watched_folders.json'
    if old_config.exists() and not config_file.exists():
        config_file.parent.mkdir(parents=True, exist_ok=True)
        old_config.rename(config_file)

    pm = ProjectManager(config_file)
    app.config['project_manager'] = pm

    sm = SettingsManager(app.config['config_dir'])
    app.config['settings_manager'] = sm

    # Start watchers for all sub-projects
    for project in pm.get_all_projects():
        start_watcher_for_project(project)

    port = find_free_port()

    is_production = os.environ.get('FLASK_ENV') == 'production'
    debug_mode = not is_production

    print(f"Starting File Viewer on http://localhost:{port}")
    print(f"Mode: {'Production' if is_production else 'Development'}")
    print(f"Watching {len(pm.get_all_projects())} sub-projects across {len(pm.get_all_groups())} groups")

    try:
        app.run(host='0.0.0.0', port=port, debug=debug_mode, use_reloader=debug_mode)
    finally:
        for watcher in app.config['watchers'].values():
            watcher.stop()


if __name__ == '__main__':
    main()
