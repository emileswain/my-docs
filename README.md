# File Viewer

A modern web application for browsing and viewing markdown, JSON, and YAML files with a Flask API backend and React frontend.

## Features

- Web-based file browser with live folder monitoring
- Support for markdown, JSON, and YAML files
- Tree-view content navigation with expandable depth control
- Multiple folder watching capability
- Modern React + TypeScript frontend
- Flask REST API backend
- Modern Tailwind CSS interface

## Architecture

- **Frontend**: React + TypeScript + Vite (port 3000 in development)
- **Backend**: Flask API server (port 6060)
- **Development**: Vite proxy forwards `/api` requests to Flask
- **Production**: Flask serves pre-built React static files

## Prerequisites

- [uv](https://github.com/astral-sh/uv) - Fast Python package installer
- [Node.js](https://nodejs.org/) - For React frontend

## Installation

```bash
# Install all dependencies (Python + Node.js)
make install
```

This will:
- Create Python virtual environment with uv
- Install Python dependencies (Flask, flask-cors, etc.)
- Install Node.js dependencies for CSS compilation
- Install Node.js dependencies for React frontend
- Build Tailwind CSS

## Usage

### Development Mode

Run both React dev server and Flask API server concurrently:

```bash
make dev
```

This will:
1. Kill any existing processes on ports 3000 and 6060
2. Start React dev server on http://localhost:3000
3. Start Flask API server on http://localhost:6060

Visit http://localhost:3000 to see the React app (API calls are proxied to Flask).

### Run Servers Individually

```bash
# Run React dev server only
make dev-frontend

# Run Flask API server only
make dev-backend
```

### Production Mode

Build and run in production mode:

```bash
make run
```

This will:
1. Build the React app to `src/fileviewer/static/dist/`
2. Build Tailwind CSS
3. Start Flask server serving the built React app

Visit http://localhost:6060 to see the production app.

## Development

### Available Make Commands

- `make help` - Show all available commands
- `make venv` - Create a virtual environment (automatically run by install)
- `make install` - Install all project dependencies (Python + Node.js)
- `make dev` - Run development servers (React + Flask) with auto-reload
- `make dev-frontend` - Run React dev server only
- `make dev-backend` - Run Flask API server only
- `make build` - Build React app for production
- `make build-css` - Build Tailwind CSS
- `make watch-css` - Watch and rebuild CSS on changes
- `make run` - Run in production mode
- `make kill-ports` - Kill any processes on ports 3000 and 6060
- `make clean` - Remove build artifacts and cache files
- `make test` - Run tests
- `make lint` - Run linting checks
- `make format` - Format code with black

### Project Structure

```
.
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── App.css          # Styles
│   │   └── main.tsx         # Entry point
│   ├── vite.config.ts       # Vite configuration (proxy settings)
│   └── package.json
├── src/fileviewer/          # Python backend
│   ├── server.py            # Flask API server
│   ├── project.py           # Project management
│   ├── file_parser.py       # File parsing logic
│   ├── watcher.py           # Folder monitoring
│   ├── static/
│   │   ├── dist/            # Built React app (production)
│   │   ├── app.js           # Legacy vanilla JS (still available)
│   │   └── output.css       # Compiled Tailwind CSS
│   └── templates/
│       ├── index.html       # Legacy template
│       └── admin.html       # Admin panel
├── Makefile                 # Build and run commands
└── package.json             # Root Node.js dependencies

```

## API Endpoints

The Flask backend provides the following REST API endpoints:

- `GET /api/projects` - List all projects
- `POST /api/projects` - Add a new project
- `PUT /api/projects/<id>` - Update a project
- `DELETE /api/projects/<id>` - Remove a project
- `GET /api/projects/<id>/browse` - Browse project files
- `GET /api/file/<path>` - Get file content and structure

## Migration Notes

The application now supports both:
1. **React frontend** (development: port 3000, production: served by Flask)
2. **Legacy vanilla JS frontend** (still available at `/admin` and templates)

You can gradually migrate features from vanilla JS to React while both remain functional.
