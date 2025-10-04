# React + Flask Setup Guide

## Quick Start

### Development Mode

```bash
# Install all dependencies
make install

# Run both React and Flask servers
make dev
```

- React dev server: http://localhost:3000
- Flask API server: http://localhost:6060

### Production Mode

```bash
# Build and run
make run
```

- Application: http://localhost:6060

## How It Works

### Development
1. `make dev` kills any processes on ports 3000 and 6060
2. Starts React dev server on port 3000 with hot reload
3. Starts Flask API server on port 6060
4. Vite proxies `/api` requests to Flask
5. Both servers run concurrently

### Production
1. `make run` builds React app to `src/fileviewer/static/dist/`
2. Flask serves the built React app
3. All requests go to Flask on port 6060

## File Changes Made

### New Files
- `frontend/` - React app directory
- `frontend/src/App.tsx` - Main React component with API integration
- `frontend/src/App.css` - Custom styles
- `frontend/vite.config.ts` - Vite proxy configuration

### Modified Files
- `src/fileviewer/server.py` - Added CORS, production mode for React
- `Makefile` - Added dev/build commands, port management
- `package.json` - Added React build scripts
- `.gitignore` - Added React build output directories
- `README.md` - Updated with React setup instructions

### Dependencies Added
- Python: `flask-cors`
- Node.js: React, TypeScript, Vite (in `frontend/package.json`)

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make dev` | Run both servers in development mode |
| `make dev-frontend` | Run React dev server only |
| `make dev-backend` | Run Flask API only |
| `make build` | Build React app for production |
| `make run` | Run in production mode |
| `make kill-ports` | Kill processes on ports 3000 and 6060 |
| `make clean` | Remove all build artifacts |
| `make install` | Install all dependencies |

## Port Management

The Makefile automatically handles port conflicts:
```makefile
kill-ports:
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@lsof -ti:6060 | xargs kill -9 2>/dev/null || true
```

This ensures clean startup even if servers were left running.

## API Integration

The React app connects to Flask via:

**Development**: Vite proxy (configured in `frontend/vite.config.ts`)
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:6060',
    changeOrigin: true,
  }
}
```

**Production**: Flask serves React from `static/dist/`
```python
@app.route('/')
def index():
    if os.environ.get('FLASK_ENV') == 'production':
        return send_from_directory(dist_dir, 'index.html')
    return render_template('index.html')
```

## Current React App

The basic React app (`frontend/src/App.tsx`):
- Fetches projects from `/api/projects`
- Displays project cards with title, description, path
- Shows loading and error states
- Links to admin panel for adding projects

## Next Steps

To expand the React app:

1. **Add React Router**
   ```bash
   cd frontend && npm install react-router-dom
   ```

2. **Add State Management**
   ```bash
   cd frontend && npm install zustand
   # or
   cd frontend && npm install @tanstack/react-query
   ```

3. **Create Components**
   - `FileTree.tsx` - File browser
   - `FileViewer.tsx` - File content viewer
   - `StructureTree.tsx` - Document structure
   - `Admin/ProjectList.tsx` - Project management

4. **Add Services**
   - `services/api.ts` - API client functions
   - `hooks/useProjects.ts` - Custom hooks
   - `types/index.ts` - TypeScript types

## Troubleshooting

### Port Already in Use
```bash
make kill-ports
```

### React Not Connecting to Flask
1. Ensure Flask is running on port 6060
2. Check Vite proxy config in `frontend/vite.config.ts`
3. Check browser console for CORS errors

### Production Build Not Working
```bash
# Clean and rebuild
make clean
make install
make run
```

### CORS Errors
Ensure `flask-cors` is installed:
```bash
uv add flask-cors
```

## Architecture Diagram

```
Development Mode:
┌─────────────────┐      ┌──────────────────┐
│  React Dev      │─────▶│  Flask API       │
│  localhost:3000 │◀─────│  localhost:6060  │
│  (Vite Proxy)   │ /api │  (CORS enabled)  │
└─────────────────┘      └──────────────────┘

Production Mode:
┌──────────────────────────┐
│  Flask Server            │
│  localhost:6060          │
│  ┌───────────────────┐   │
│  │ React Static App  │   │
│  │ (dist/)           │   │
│  └───────────────────┘   │
│  ┌───────────────────┐   │
│  │ API Endpoints     │   │
│  │ (/api/*)          │   │
│  └───────────────────┘   │
└──────────────────────────┘
```

## Testing the Setup

1. **Test Development Mode**
   ```bash
   make dev
   # Visit http://localhost:3000
   # Should see React app with projects
   ```

2. **Test API Connection**
   ```bash
   # In browser console on http://localhost:3000
   fetch('/api/projects').then(r => r.json()).then(console.log)
   ```

3. **Test Production Mode**
   ```bash
   make run
   # Visit http://localhost:6060
   # Should see built React app
   ```

## Legacy Support

The vanilla JavaScript frontend is still available:
- Admin panel: http://localhost:6060/admin
- Original viewer: http://localhost:6060/ (when not in production mode)

This allows gradual migration from vanilla JS to React.
