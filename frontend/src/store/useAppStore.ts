import { create } from 'zustand';

/**
 * useAppStore - Global state store for UI-related state
 *
 * Purpose:
 * - Manages all UI state (panel visibility, theme, view mode)
 * - Persists UI preferences to localStorage
 * - Separated from data state for better organization
 *
 * Used by:
 * - Layout component (panel visibility)
 * - FileTree component (left panel visibility)
 * - StructureTree component (right panel visibility)
 * - FileViewer component (raw/rendered view mode, current heading)
 * - All viewer components (dark mode theme)
 * - App component (dark mode for theme application)
 *
 * State:
 * - leftPanelVisible: File tree panel visibility
 * - rightPanelVisible: Structure tree panel visibility
 * - showRaw: Toggle between raw and rendered view
 * - darkMode: Dark/light theme preference
 * - currentHeading: Current markdown heading for navigation
 *
 * Special considerations:
 * - All state is persisted to localStorage on change
 * - Dark mode is initialized from localStorage on app start
 * - Panel visibility defaults to true if not in localStorage
 */
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

  // Current heading (for markdown files)
  currentHeading: string;
  setCurrentHeading: (heading: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
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

  // Theme
  darkMode: localStorage.getItem('darkMode') === 'true',
  setDarkMode: (dark) => {
    set({ darkMode: dark });
    localStorage.setItem('darkMode', String(dark));
  },

  // Current heading
  currentHeading: '',
  setCurrentHeading: (heading) => set({ currentHeading: heading }),
}));
