# Review: React Architecture Refactoring Recommendations

## Current State Analysis

### Existing Structure
```
frontend/src/
├── components/          # View components (mixed concerns)
│   ├── FileTree.tsx     # 450+ lines - data fetching + UI
│   ├── FileViewer.tsx   # File content display + data fetching
│   ├── Admin.tsx        # Admin UI + CRUD logic
│   └── viewers/         # Presentation components (good separation)
├── services/
│   └── api.ts          # API calls (basic)
├── store/
│   └── useStore.ts     # Global state (Zustand)
└── hooks/
    └── useScrollPosition.ts
```

### Current Issues

1. **Violation of Separation of Concerns**
   - `FileTree.tsx` (454 lines): Mixes data fetching, caching, SSE handling, UI rendering, and business logic
   - Components directly call API methods
   - No clear data layer between UI and API

2. **Missing Abstractions**
   - No repository/service layer for data operations
   - No custom hooks for reusable logic
   - SSE connection logic embedded in component
   - File tree caching logic in component

3. **State Management Issues**
   - Mix of local state (`useState`) and global state (`useStore`)
   - No clear boundaries for what goes where
   - LocalStorage access scattered throughout

4. **Lack of Reusability**
   - Business logic tightly coupled to components
   - Difficult to test logic independently
   - Hard to reuse patterns across features

## Recommended Architecture

Based on React best practices, here's the recommended structure similar to Flutter's BLoC pattern:

```
frontend/src/
├── components/              # Pure presentation components
│   ├── FileTree/
│   │   ├── FileTree.tsx            # UI only
│   │   ├── FileTreeItem.tsx        # UI only
│   │   └── FileTreeToolbar.tsx     # UI only
│   ├── FileViewer/
│   │   ├── FileViewer.tsx          # UI only
│   │   └── FileViewerHeader.tsx    # UI only
│   └── Admin/
│       ├── Admin.tsx               # UI only
│       ├── ProjectList.tsx         # UI only
│       └── ProjectForm.tsx         # UI only
│
├── hooks/                   # Custom hooks (business logic)
│   ├── useProjects.ts              # Project CRUD operations
│   ├── useFileTree.ts              # File tree state & operations
│   ├── useFileContent.ts           # File content loading
│   ├── useFileSystemEvents.ts      # SSE connection & handling
│   ├── useLocalStorage.ts          # LocalStorage abstraction
│   └── useTheme.ts                 # Theme management
│
├── services/                # Data providers (API layer)
│   ├── projectService.ts           # Project API calls
│   ├── fileService.ts              # File browsing/content API
│   └── eventService.ts             # SSE service
│
├── repositories/            # Data repositories (caching/normalization)
│   ├── fileTreeRepository.ts       # File tree cache management
│   └── projectRepository.ts        # Project data management
│
├── store/                   # Global state stores
│   ├── useAppStore.ts              # UI state (panels, theme)
│   ├── useProjectStore.ts          # Project & file state
│   └── useFileTreeStore.ts         # File tree cache state
│
└── types/                   # TypeScript types
    ├── project.ts
    ├── file.ts
    └── api.ts
```

## Detailed Refactoring Plan

### Phase 1: Extract Services (Providers)

Create a clear API service layer:

**`services/projectService.ts`**
```typescript
export class ProjectService {
  async fetchProjects(): Promise<Project[]> {
    const response = await fetch('/api/projects');
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  }

  async createProject(data: CreateProjectDto): Promise<Project> {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  }

  async updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  }

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete project');
  }
}

export const projectService = new ProjectService();
```

**`services/fileService.ts`**
```typescript
export class FileService {
  async browseProject(
    projectId: string,
    path?: string
  ): Promise<BrowseResponse> {
    const url = path
      ? `/api/projects/${projectId}/browse/${path}`
      : `/api/projects/${projectId}/browse`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to browse project');
    return response.json();
  }

  async fetchFileContent(path: string): Promise<FileContent> {
    const encodedPath = path.startsWith('/') ? path.substring(1) : path;
    const response = await fetch(`/api/file/${encodedPath}`);
    if (!response.ok) throw new Error('Failed to fetch file');
    return response.json();
  }

  async browseAllFolders(
    projectId: string,
    projectPath: string
  ): Promise<Map<string, FileItem[]>> {
    // Recursive browsing logic
    const cache = new Map<string, FileItem[]>();

    const loadFolder = async (folderPath: string): Promise<FileItem[]> => {
      const relativePath = folderPath.startsWith(projectPath)
        ? folderPath.substring(projectPath.length).replace(/^\/+/, '')
        : '';

      const data = await this.browseProject(projectId, relativePath || undefined);
      cache.set(folderPath, data.items);

      // Recursively load subfolders
      const subfolderPromises = data.items
        .filter(item => item.type === 'folder')
        .map(folder => loadFolder(folder.path));

      await Promise.all(subfolderPromises);
      return data.items;
    };

    await loadFolder(projectPath);
    return cache;
  }
}

export const fileService = new FileService();
```

**`services/eventService.ts`**
```typescript
export type FileSystemEventHandler = (event: {
  type: string;
  path: string;
  project_id: string;
}) => void;

export class EventService {
  private eventSource: EventSource | null = null;
  private handlers: Set<FileSystemEventHandler> = new Set();

  connect() {
    if (this.eventSource) return;

    this.eventSource = new EventSource('/api/events');

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handlers.forEach(handler => handler(data));
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.disconnect();
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  subscribe(handler: FileSystemEventHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
}

export const eventService = new EventService();
```

### Phase 2: Create Custom Hooks (Business Logic)

**`hooks/useProjects.ts`**
```typescript
import { useCallback } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { projectService } from '../services/projectService';

export function useProjects() {
  const { projects, setProjects, addProject, updateProject, removeProject } = useProjectStore();

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectService.fetchProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      throw error;
    }
  }, [setProjects]);

  const createProject = useCallback(async (data: CreateProjectDto) => {
    try {
      const project = await projectService.createProject(data);
      addProject(project);
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }, [addProject]);

  const editProject = useCallback(async (id: string, data: UpdateProjectDto) => {
    try {
      const project = await projectService.updateProject(id, data);
      updateProject(project);
      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }, [updateProject]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await projectService.deleteProject(id);
      removeProject(id);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }, [removeProject]);

  return {
    projects,
    loadProjects,
    createProject,
    editProject,
    deleteProject,
  };
}
```

**`hooks/useFileTree.ts`**
```typescript
import { useState, useCallback, useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { useFileTreeStore } from '../store/useFileTreeStore';
import { fileService } from '../services/fileService';

export function useFileTree(projectId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const { openFolders, setOpenFolders, toggleFolder } = useProjectStore();
  const { fileTreeCache, setFileTreeCache } = useFileTreeStore();

  const loadFileTree = useCallback(async () => {
    if (!projectId) return;

    const project = useProjectStore.getState().projects.find(p => p.id === projectId);
    if (!project) return;

    setIsLoading(true);
    try {
      const cache = await fileService.browseAllFolders(project.id, project.path);
      const rootItems = cache.get(project.path) || [];

      setFileTreeCache(projectId, {
        cache,
        rootItems,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error('Error loading file tree:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, setFileTreeCache]);

  const getTreeData = useCallback(() => {
    if (!projectId) return null;
    return fileTreeCache[projectId];
  }, [projectId, fileTreeCache]);

  return {
    isLoading,
    treeData: getTreeData(),
    openFolders: projectId ? openFolders[projectId] || [] : [],
    loadFileTree,
    toggleFolder: (path: string) => projectId && toggleFolder(projectId, path),
    setOpenFolders: (folders: string[]) => projectId && setOpenFolders(projectId, folders),
  };
}
```

**`hooks/useFileSystemEvents.ts`**
```typescript
import { useEffect } from 'react';
import { eventService } from '../services/eventService';

export function useFileSystemEvents(
  projectId: string | null,
  onEvent: (event: { type: string; path: string }) => void
) {
  useEffect(() => {
    if (!projectId) return;

    eventService.connect();

    const unsubscribe = eventService.subscribe((event) => {
      if (event.project_id === projectId) {
        onEvent(event);
      }
    });

    return () => {
      unsubscribe();
      // Don't disconnect here - other components might be using it
    };
  }, [projectId, onEvent]);
}
```

**`hooks/useFileContent.ts`**
```typescript
import { useState, useCallback } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { fileService } from '../services/fileService';

export function useFileContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { currentFile, setCurrentFile } = useProjectStore();

  const loadFile = useCallback(async (path: string, name: string) => {
    setIsLoading(true);
    try {
      const content = await fileService.fetchFileContent(path);
      setCurrentFile(path, name, content);
    } catch (error) {
      console.error('Error loading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentFile]);

  return {
    currentFile,
    isLoading,
    loadFile,
  };
}
```

### Phase 3: Split State Stores

**`store/useAppStore.ts`** - UI-only state
```typescript
import { create } from 'zustand';

interface AppState {
  // Panel visibility
  leftPanelVisible: boolean;
  rightPanelVisible: boolean;
  setLeftPanelVisible: (visible: boolean) => void;
  setRightPanelVisible: (visible: boolean) => void;

  // View mode
  showRaw: boolean;
  setShowRaw: (show: boolean) => void;

  // Theme
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;

  // Current heading (for markdown)
  currentHeading: string;
  setCurrentHeading: (heading: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  leftPanelVisible: localStorage.getItem('leftPanelVisible') !== 'false',
  rightPanelVisible: localStorage.getItem('rightPanelVisible') !== 'false',
  setLeftPanelVisible: (visible) => {
    set({ leftPanelVisible: visible });
    localStorage.setItem('leftPanelVisible', String(visible));
  },
  setRightPanelVisible: (visible) => {
    set({ rightPanelVisible: visible });
    localStorage.setItem('rightPanelVisible', String(visible));
  },

  showRaw: false,
  setShowRaw: (show) => set({ showRaw: show }),

  darkMode: localStorage.getItem('darkMode') === 'true',
  setDarkMode: (dark) => {
    set({ darkMode: dark });
    localStorage.setItem('darkMode', String(dark));
  },

  currentHeading: '',
  setCurrentHeading: (heading) => set({ currentHeading: heading }),
}));
```

**`store/useProjectStore.ts`** - Project & file state
```typescript
import { create } from 'zustand';
import type { Project, FileContent } from '../types';

interface ProjectState {
  // Projects
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;

  // Current file
  currentFile: string | null;
  currentFileName: string | null;
  currentFileContent: FileContent | null;
  setCurrentFile: (path: string | null, name: string | null, content: FileContent | null) => void;

  // Open folders (per project)
  openFolders: Record<string, string[]>;
  setOpenFolders: (projectId: string, folders: string[]) => void;
  toggleFolder: (projectId: string, folderPath: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => {
    set({ currentProject: project });
    if (project) {
      localStorage.setItem('currentProjectId', project.id);
    }
  },
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
  updateProject: (project) => set((state) => ({
    projects: state.projects.map(p => p.id === project.id ? project : p)
  })),
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  })),

  currentFile: null,
  currentFileName: null,
  currentFileContent: null,
  setCurrentFile: (path, name, content) => {
    set({
      currentFile: path,
      currentFileName: name,
      currentFileContent: content,
    });
    if (path) {
      localStorage.setItem('currentFile', path);
    }
  },

  openFolders: {},
  setOpenFolders: (projectId, folders) => {
    set((state) => ({
      openFolders: { ...state.openFolders, [projectId]: folders }
    }));
    localStorage.setItem(`openFolders_${projectId}`, JSON.stringify(folders));
  },
  toggleFolder: (projectId, folderPath) => {
    const state = get();
    const projectFolders = state.openFolders[projectId] || [];
    const isOpen = projectFolders.includes(folderPath);

    const newFolders = isOpen
      ? projectFolders.filter((f) => f !== folderPath)
      : [...projectFolders, folderPath];

    state.setOpenFolders(projectId, newFolders);
  },
}));
```

**`store/useFileTreeStore.ts`** - File tree cache
```typescript
import { create } from 'zustand';
import type { FileItem } from '../types';

interface FileTreeCache {
  cache: Map<string, FileItem[]>;
  rootItems: FileItem[];
  lastUpdated: number;
}

interface FileTreeState {
  fileTreeCache: Record<string, FileTreeCache>;
  setFileTreeCache: (projectId: string, data: FileTreeCache) => void;
  clearCache: (projectId: string) => void;
}

export const useFileTreeStore = create<FileTreeState>((set) => ({
  fileTreeCache: {},
  setFileTreeCache: (projectId, data) => set((state) => ({
    fileTreeCache: { ...state.fileTreeCache, [projectId]: data }
  })),
  clearCache: (projectId) => set((state) => {
    const newCache = { ...state.fileTreeCache };
    delete newCache[projectId];
    return { fileTreeCache: newCache };
  }),
}));
```

### Phase 4: Refactor Components to Pure UI

**`components/FileTree/FileTree.tsx`** - Simplified to ~100 lines
```typescript
import { useEffect } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useFileTree } from '../../hooks/useFileTree';
import { useFileSystemEvents } from '../../hooks/useFileSystemEvents';
import { FileTreeToolbar } from './FileTreeToolbar';
import { FileTreeItem } from './FileTreeItem';

interface FileTreeProps {
  onFileSelect: (path: string, name: string) => void;
}

export function FileTree({ onFileSelect }: FileTreeProps) {
  const { currentProject } = useProjectStore();
  const {
    isLoading,
    treeData,
    openFolders,
    loadFileTree,
    toggleFolder,
    setOpenFolders,
  } = useFileTree(currentProject?.id || null);

  // Load file tree on project change
  useEffect(() => {
    if (currentProject) {
      loadFileTree();
    }
  }, [currentProject, loadFileTree]);

  // Listen for file system changes
  useFileSystemEvents(currentProject?.id || null, () => {
    console.log('File system changed, reloading tree...');
    loadFileTree();
  });

  if (!currentProject) {
    return (
      <div className="p-4 text-center" style={{ color: 'var(--text-tertiary)' }}>
        Select a project to browse
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center" style={{ color: 'var(--text-tertiary)' }}>
        Loading file tree...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <FileTreeToolbar
        projectId={currentProject.id}
        openFolders={openFolders}
        allFolders={treeData ? Array.from(treeData.cache.keys()) : []}
        onToggleAll={setOpenFolders}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {treeData?.rootItems.map((item) => (
          <FileTreeItem
            key={item.path}
            item={item}
            onFileSelect={onFileSelect}
            projectId={currentProject.id}
            openFolders={openFolders}
            allItems={treeData.cache}
            onToggle={toggleFolder}
          />
        ))}
      </div>
    </div>
  );
}
```

## Benefits of Refactoring

### 1. **Separation of Concerns**
- Components focus purely on UI rendering
- Business logic in custom hooks
- Data fetching in services
- State management in stores

### 2. **Testability**
- Services can be unit tested independently
- Hooks can be tested with React Testing Library
- Components can be tested with mocked hooks

### 3. **Reusability**
- `useProjects()` can be used in multiple components
- `useFileSystemEvents()` can be reused anywhere
- Services can be shared across features

### 4. **Maintainability**
- Clear boundaries between layers
- Easy to locate where logic lives
- Simpler debugging

### 5. **Scalability**
- Easy to add new features
- Can introduce caching strategies in repositories
- Can swap implementations without touching UI

## Migration Strategy

### Phase 1: Extract Services (Week 1)
1. Create service classes for API calls
2. Update existing code to use services
3. Add error handling and typing

### Phase 2: Create Custom Hooks (Week 2)
1. Extract business logic from FileTree
2. Extract business logic from Admin
3. Create reusable hooks

### Phase 3: Split Stores (Week 3)
1. Separate UI state from data state
2. Add proper store organization
3. Migrate components to use new stores

### Phase 4: Refactor Components (Week 4)
1. Simplify FileTree to use hooks
2. Simplify Admin to use hooks
3. Remove direct API calls from components

### Phase 5: Add Tests (Week 5)
1. Unit tests for services
2. Hook tests
3. Component integration tests

## Additional Best Practices

1. **Error Boundaries**: Add React error boundaries
2. **Loading States**: Consistent loading UX
3. **TypeScript**: Strict typing throughout
4. **Code Splitting**: Lazy load routes/components
5. **Performance**: Memoization where appropriate

## Conclusion

The current codebase works but violates key React principles. The refactoring will:
- Make code more maintainable
- Enable better testing
- Improve developer experience
- Scale better as the app grows

The architecture mirrors Flutter's BLoC pattern with:
- **Services** = Data Providers
- **Hooks** = BLoC/Cubit logic
- **Stores** = State repositories
- **Components** = Pure UI widgets
