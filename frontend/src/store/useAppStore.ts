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
