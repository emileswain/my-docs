import { create } from 'zustand';
import type { Project, FileContent } from '../types';

interface AppState {
  // Projects
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;

  // Current file
  currentFile: string | null;
  currentFileName: string | null;
  currentFileContent: FileContent | null;
  setCurrentFile: (path: string | null, name: string | null, content: FileContent | null) => void;

  // Open folders (per project)
  openFolders: Record<string, string[]>;
  setOpenFolders: (projectId: string, folders: string[]) => void;
  toggleFolder: (projectId: string, folderPath: string) => void;

  // Panel visibility
  leftPanelVisible: boolean;
  rightPanelVisible: boolean;
  setLeftPanelVisible: (visible: boolean) => void;
  setRightPanelVisible: (visible: boolean) => void;

  // View mode
  showRaw: boolean;
  setShowRaw: (show: boolean) => void;

  // Current heading (for markdown files)
  currentHeading: string;
  setCurrentHeading: (heading: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Projects
  projects: [],
  currentProject: null,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => {
    set({ currentProject: project });
    // Save to localStorage
    if (project) {
      localStorage.setItem('currentProjectId', project.id);
    }
  },

  // Current file
  currentFile: null,
  currentFileName: null,
  currentFileContent: null,
  setCurrentFile: (path, name, content) => {
    set({
      currentFile: path,
      currentFileName: name,
      currentFileContent: content,
      showRaw: false // Reset to rendered view
    });
    // Save to localStorage
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
    // Save to localStorage
    localStorage.setItem(`openFolders_${projectId}`, JSON.stringify(folders));
  },
  toggleFolder: (projectId, folderPath) => {
    const state = get();
    const projectFolders = state.openFolders[projectId] || [];
    const index = projectFolders.indexOf(folderPath);

    let newFolders: string[];
    if (index > -1) {
      // Remove folder
      newFolders = projectFolders.filter((f) => f !== folderPath);
    } else {
      // Add folder
      newFolders = [...projectFolders, folderPath];
    }

    state.setOpenFolders(projectId, newFolders);
  },

  // Panel visibility
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

  // View mode
  showRaw: false,
  setShowRaw: (show) => set({ showRaw: show }),

  // Current heading
  currentHeading: '',
  setCurrentHeading: (heading) => set({ currentHeading: heading }),
}));

// Helper to load open folders from localStorage
export function loadOpenFoldersFromStorage(projectId: string): string[] {
  const saved = localStorage.getItem(`openFolders_${projectId}`);
  return saved ? JSON.parse(saved) : [];
}
