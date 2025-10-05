# File Viewer Frontend

React + TypeScript + Vite frontend for the File Viewer application.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **React Syntax Highlighter** - Code highlighting

## Architecture

The frontend follows a clean separation of concerns pattern:

### Layers

1. **Components** (`src/components/`)
   - Pure presentational components
   - No direct API calls or business logic
   - Organized by feature (common, admin, viewers)

2. **Hooks** (`src/hooks/`)
   - Custom hooks containing business logic
   - Bridge between components and services
   - Examples: `useProjects`, `useFileTree`, `useFileContent`

3. **Services** (`src/services/`)
   - API calls and external service communication
   - Class-based services (ProjectService, FileService, EventService)
   - Single source of truth for API endpoints

4. **Stores** (`src/store/`)
   - Global state management with Zustand
   - Separated by concern (UI state vs data state)
   - localStorage persistence for user preferences

### Key Features

- **Real-time updates** via Server-Sent Events (SSE)
- **Theme support** with dark/light modes
- **File tree caching** for fast navigation
- **Type-safe** with TypeScript throughout

## Development

### Running Locally

From the project root:
```bash
make dev-frontend  # Run frontend dev server only
```

Or from the frontend directory:
```bash
npm run dev
```

The dev server runs on http://localhost:3030 and proxies `/api` requests to the Flask backend at http://localhost:6060.

### Building for Production

From the project root:
```bash
make build
```

Or from the frontend directory:
```bash
npm run build
```

This builds the app to `dist/` which is then copied to the Flask backend's static directory.

## Project Structure

```
src/
├── components/           # React components
│   ├── common/          # Reusable UI (Modal, Dropdown, Navigation, etc.)
│   ├── admin/           # Admin page components
│   ├── viewers/         # File viewers (Markdown, JSON, YAML)
│   └── FileTree/        # File tree browser
├── hooks/               # Custom hooks (business logic)
├── services/            # API services
├── store/               # Zustand stores
├── types/               # TypeScript type definitions
├── App.tsx              # Root component
└── main.tsx             # Entry point
```
