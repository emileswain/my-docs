# File Viewer

A modern web application for browsing and viewing markdown, JSON, and YAML files with a Flask API backend and React frontend.

## Features

- Web-based file browser with real-time file system monitoring via SSE
- Support for markdown, JSON, and YAML files
- Tree-view content navigation for markdown files
- Multiple project management
- Modern React + TypeScript frontend with component-based architecture
- Flask REST API backend
- Tailwind CSS with custom theming (dark/light mode)
- Separation of concerns following React best practices

## Architecture

- **Frontend**: React + TypeScript + Vite (port 3030 in development)
- **Backend**: Flask API server (port 6060)
- **State Management**: Zustand (separate stores for UI and data)
- **Development**: Vite proxy forwards `/api` requests to Flask
- **Production**: Flask serves pre-built React static files from `static/dist/`

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
- Install Python dependencies (Flask, flask-cors, watchdog, etc.)
- Install Node.js dependencies for React frontend (Vite, React, Tailwind, etc.)

## Usage

### Quick Start

**Using Make (recommended):**
```bash
make dev
```

**Without Make:**
```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
uv run fileviewer
```

Visit http://localhost:3030 (dev) or http://localhost:6060 (production)

### Development Mode

**With Make:**
```bash
make dev          # Run both servers
make dev-frontend # Frontend only
make dev-backend  # Backend only
```

**Without Make:**
```bash
# Frontend (port 3030)
cd frontend && npm run dev

# Backend (port 6060)
uv run fileviewer
```

### Production Mode

**With Make:**
```bash
make run
```

**Without Make:**
```bash
# Build frontend
cd frontend && npm run build

# Copy to Flask static directory
cp -r frontend/dist/* src/fileviewer/static/dist/

# Run Flask
uv run fileviewer
```

Visit http://localhost:6060

## Development

### Available Make Commands

- `make help` - Show all available commands
- `make venv` - Create a virtual environment (automatically run by install)
- `make install` - Install all project dependencies (Python + Node.js)
- `make dev` - Run development servers (React + Flask) with auto-reload
- `make dev-frontend` - Run React dev server only
- `make dev-backend` - Run Flask API server only
- `make build` - Build React app for production
- `make run` - Run in production mode
- `make kill-ports` - Kill any processes on ports 3030 and 6060
- `make clean` - Remove build artifacts and cache files
- `make test` - Run tests
- `make lint` - Run linting checks
- `make format` - Format code with black

### Project Structure

```
.
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── common/           # Reusable UI components (Dropdown, Modal, etc.)
│   │   │   ├── admin/            # Admin-specific components
│   │   │   ├── viewers/          # File viewer components (Markdown, JSON, YAML)
│   │   │   ├── FileTree/         # File tree browser
│   │   │   ├── Layout.tsx        # Main app layout
│   │   │   └── Admin.tsx         # Admin page
│   │   ├── hooks/                # Custom React hooks (business logic)
│   │   │   ├── useProjects.ts    # Project CRUD operations
│   │   │   ├── useFileTree.ts    # File tree state management
│   │   │   ├── useFileContent.ts # File loading
│   │   │   └── useFileSystemEvents.ts # SSE file watching
│   │   ├── services/             # API service layer
│   │   │   ├── projectService.ts # Project API calls
│   │   │   ├── fileService.ts    # File API calls
│   │   │   └── eventService.ts   # SSE connection management
│   │   ├── store/                # Zustand state stores
│   │   │   ├── useAppStore.ts    # UI state (theme, panels)
│   │   │   ├── useProjectStore.ts # Data state (projects, files)
│   │   │   └── useFileTreeStore.ts # File tree cache
│   │   ├── types/                # TypeScript types
│   │   ├── App.tsx               # Root component
│   │   └── main.tsx              # Entry point
│   ├── vite.config.ts            # Vite configuration (proxy to Flask)
│   └── package.json
├── src/fileviewer/               # Python backend
│   ├── server.py                 # Flask API server
│   ├── project.py                # Project management
│   ├── file_parser.py            # File parsing (Markdown, JSON, YAML)
│   ├── watcher.py                # File system monitoring with SSE
│   └── static/
│       └── dist/                 # Built React app (production)
├── Makefile                      # Build and run commands
└── pyproject.toml                # Python dependencies

```

## API Endpoints

The Flask backend provides the following REST API endpoints:

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `PUT /api/projects/<id>` - Update a project
- `DELETE /api/projects/<id>` - Delete a project

### Files
- `GET /api/projects/<project_id>/browse?path=<path>` - Browse files in a project directory
- `GET /api/file?path=<path>` - Get file content and parsed structure

### Events
- `GET /api/events` - Server-Sent Events endpoint for real-time file system changes

## Frontend Architecture

The React frontend follows a clean separation of concerns pattern:

- **Components** (UI layer) - Pure presentational components
- **Hooks** (Business logic layer) - Custom hooks containing application logic
- **Services** (Data layer) - API calls and external service communication
- **Stores** (State layer) - Global state management with Zustand

This architecture is similar to Flutter's BLoC pattern and ensures:
- High testability
- Easy refactoring
- Clear responsibilities
- Reusable components
