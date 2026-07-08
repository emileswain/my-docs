import { create } from 'zustand';
import type { ProjectGroup, SubProject, FileContent } from '../types';

interface ProjectState {
  // Groups
  groups: ProjectGroup[];
  currentGroup: ProjectGroup | null;
  currentSubProject: SubProject | null;
  setGroups: (groups: ProjectGroup[]) => void;
  setCurrentGroup: (group: ProjectGroup | null) => void;
  setCurrentSubProject: (sub: SubProject | null) => void;

  // Group CRUD helpers
  addGroup: (group: ProjectGroup) => void;
  updateGroup: (group: ProjectGroup) => void;
  removeGroup: (id: string) => void;
  addSubProject: (groupId: string, sub: SubProject) => void;
  updateSubProject: (groupId: string, sub: SubProject) => void;
  removeSubProject: (groupId: string, subId: string) => void;

  // Current file
  currentFile: string | null;
  currentFileName: string | null;
  currentFileContent: FileContent | null;
  setCurrentFile: (path: string | null, name: string | null, content: FileContent | null) => void;

  /** @deprecated Use currentSubProject - compatibility alias for components that haven't been updated */
  currentProject: SubProject | null;

  // Open folders (per sub-project)
  openFolders: Record<string, string[]>;
  setOpenFolders: (subProjectId: string, folders: string[]) => void;
  toggleFolder: (subProjectId: string, folderPath: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Groups
  groups: [],
  currentGroup: null,
  currentSubProject: null,

  currentProject: null,

  setGroups: (groups) => set({ groups }),

  setCurrentGroup: (group) => {
    set({ currentGroup: group });
    if (group) {
      localStorage.setItem('currentGroupId', group.id);
    }
  },

  setCurrentSubProject: (sub) => {
    set({ currentSubProject: sub, currentProject: sub });
    if (sub) {
      localStorage.setItem('currentSubProjectId', sub.id);
    }
  },

  addGroup: (group) => set((state) => ({
    groups: [...state.groups, group],
  })),

  updateGroup: (group) => set((state) => ({
    groups: state.groups.map(g => g.id === group.id ? group : g),
    currentGroup: state.currentGroup?.id === group.id ? group : state.currentGroup,
  })),

  removeGroup: (id) => set((state) => ({
    groups: state.groups.filter(g => g.id !== id),
    currentGroup: state.currentGroup?.id === id ? null : state.currentGroup,
    currentSubProject: state.currentGroup?.id === id ? null : state.currentSubProject,
  })),

  addSubProject: (groupId, sub) => set((state) => ({
    groups: state.groups.map(g =>
      g.id === groupId
        ? { ...g, subprojects: [...g.subprojects, sub] }
        : g
    ),
    currentGroup: state.currentGroup?.id === groupId
      ? { ...state.currentGroup, subprojects: [...state.currentGroup.subprojects, sub] }
      : state.currentGroup,
  })),

  updateSubProject: (groupId, sub) => set((state) => ({
    groups: state.groups.map(g =>
      g.id === groupId
        ? { ...g, subprojects: g.subprojects.map(sp => sp.id === sub.id ? sub : sp) }
        : g
    ),
    currentGroup: state.currentGroup?.id === groupId
      ? { ...state.currentGroup, subprojects: state.currentGroup.subprojects.map(sp => sp.id === sub.id ? sub : sp) }
      : state.currentGroup,
    currentSubProject: state.currentSubProject?.id === sub.id ? sub : state.currentSubProject,
  })),

  removeSubProject: (groupId, subId) => set((state) => ({
    groups: state.groups.map(g =>
      g.id === groupId
        ? { ...g, subprojects: g.subprojects.filter(sp => sp.id !== subId) }
        : g
    ),
    currentGroup: state.currentGroup?.id === groupId
      ? { ...state.currentGroup, subprojects: state.currentGroup.subprojects.filter(sp => sp.id !== subId) }
      : state.currentGroup,
    currentSubProject: state.currentSubProject?.id === subId ? null : state.currentSubProject,
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
  setOpenFolders: (subProjectId, folders) => {
    set((state) => ({
      openFolders: { ...state.openFolders, [subProjectId]: folders }
    }));
    localStorage.setItem(`openFolders_${subProjectId}`, JSON.stringify(folders));
  },
  toggleFolder: (subProjectId, folderPath) => {
    const state = get();
    const projectFolders = state.openFolders[subProjectId] || [];
    const isOpen = projectFolders.includes(folderPath);

    const newFolders = isOpen
      ? projectFolders.filter((f) => f !== folderPath)
      : [...projectFolders, folderPath];

    state.setOpenFolders(subProjectId, newFolders);
  },
}));

export function loadOpenFoldersFromStorage(subProjectId: string): string[] {
  const saved = localStorage.getItem(`openFolders_${subProjectId}`);
  return saved ? JSON.parse(saved) : [];
}
