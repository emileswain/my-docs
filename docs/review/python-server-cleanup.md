# Review: Python Server Cleanup

## Changes Made

Migrated from server-side template rendering to serving a React SPA, while keeping the markdown-to-HTML conversion on the server side. The following changes were made to `src/fileviewer/server.py`:

### Removed Dependencies
- `render_template` from Flask (no longer using Jinja2 templates)
- Unused imports: `json`

### Kept Dependencies
- `markdown` library - Still needed for server-side HTML conversion of markdown files
- `request` from Flask - Used in POST/PUT endpoints

### Updated Routes

#### `GET /` - Index Route
**Before:**
- Checked for production mode
- Rendered `index.html` template via Jinja2 or served from static dist directory

**After:**
- Always serves the React frontend from `frontend/dist/index.html`
- Returns error if frontend not built

#### `GET /admin` - Admin Route
**Removed** - No longer a separate route; admin functionality is handled within the React SPA

#### `GET /api/file/<path:file_path>` - File Content API
**Before:**
- Returned `tree`, `content`, `html`, and `type`
- Converted markdown to HTML server-side using the `markdown` library
- Added copy buttons to code blocks in the HTML via string replacement

**After:**
- Still returns `tree`, `content`, `html`, and `type`
- Still converts markdown to HTML server-side
- Removed the copy button injection (handled by React components now)

## API Endpoints Preserved

All core API functionality remains intact:

1. **Project Management**
   - `GET /api/projects` - List all projects
   - `POST /api/projects` - Add new project
   - `PUT /api/projects/<project_id>` - Update project
   - `DELETE /api/projects/<project_id>` - Remove project

2. **File Browsing**
   - `GET /api/projects/<project_identifier>/browse` - Browse project root
   - `GET /api/projects/<project_identifier>/browse/<path:subpath>` - Browse subfolder

3. **File Content**
   - `GET /api/file/<path:file_path>` - Get file tree structure and raw content

## Benefits

1. **Cleaner separation of concerns** - Backend is pure API, frontend handles all presentation
2. **Reduced server-side dependencies** - No longer need markdown rendering libraries
3. **Better performance** - HTML rendering happens on the client, reducing server load
4. **More maintainable** - Single source of truth for UI rendering (React)
5. **Better caching** - Static React app can be cached by browser

## Next Steps

Consider removing the old template files if they still exist:
- `templates/index.html`
- `templates/admin.html`
