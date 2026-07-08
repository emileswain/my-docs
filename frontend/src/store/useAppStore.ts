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
  // Panel visibility and sizing
  leftPanelVisible: boolean;
  rightPanelVisible: boolean;
  leftPanelWidth: number;
  setLeftPanelVisible: (visible: boolean) => void;
  setRightPanelVisible: (visible: boolean) => void;
  setLeftPanelWidth: (width: number) => void;

  // View mode
  showRaw: boolean;
  setShowRaw: (show: boolean) => void;

  // Theme
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;

  // Current heading (for markdown files)
  currentHeading: string;
  setCurrentHeading: (heading: string) => void;

  // Notes panel
  notesPanelVisible: boolean;
  notesPanelPosition: 'bottom' | 'right';
  setNotesPanelVisible: (visible: boolean) => void;
  setNotesPanelPosition: (position: 'bottom' | 'right') => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Panel visibility and sizing
  leftPanelVisible: localStorage.getItem('leftPanelVisible') !== 'false',
  rightPanelVisible: localStorage.getItem('rightPanelVisible') !== 'false',
  leftPanelWidth: parseInt(localStorage.getItem('leftPanelWidth') || '300', 10),
  setLeftPanelVisible: (visible) => {
    set({ leftPanelVisible: visible });
    localStorage.setItem('leftPanelVisible', String(visible));
  },
  setRightPanelVisible: (visible) => {
    set({ rightPanelVisible: visible });
    localStorage.setItem('rightPanelVisible', String(visible));
  },
  setLeftPanelWidth: (width) => {
    set({ leftPanelWidth: width });
    localStorage.setItem('leftPanelWidth', String(width));
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

  // Notes panel
  notesPanelVisible: localStorage.getItem('notesPanelVisible') === 'true',
  notesPanelPosition: (localStorage.getItem('notesPanelPosition') as 'bottom' | 'right') || 'bottom',
  setNotesPanelVisible: (visible) => {
    set({ notesPanelVisible: visible });
    localStorage.setItem('notesPanelVisible', String(visible));
  },
  setNotesPanelPosition: (position) => {
    set({ notesPanelPosition: position });
    localStorage.setItem('notesPanelPosition', position);
  },
}));
