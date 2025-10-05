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
  // Projects
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
    projects: state.projects.map(p => p.id === project.id ? project : p),
    currentProject: state.currentProject?.id === project.id ? project : state.currentProject
  })),
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id),
    currentProject: state.currentProject?.id === id ? null : state.currentProject
  })),

  // Current file
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

  // Open folders
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

// Helper to load open folders from localStorage
export function loadOpenFoldersFromStorage(projectId: string): string[] {
  const saved = localStorage.getItem(`openFolders_${projectId}`);
  return saved ? JSON.parse(saved) : [];
}
