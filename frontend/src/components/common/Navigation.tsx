import { ProjectSelector } from './ProjectSelector';
import type { Project } from '../../types';

/**
 * Navigation - Top navigation bar component
 *
 * Purpose:
 * - Displays application logo and branding
 * - Provides project selection dropdown
 * - Includes theme toggle and settings link
 * - Maintains consistent navigation UI across app
 *
 * Used by:
 * - Layout component (main app layout)
 *
 * Props:
 * - projects: Array of available projects
 * - currentProject: Currently selected project (null if none)
 * - onProjectSelect: Callback when a project is selected
 * - darkMode: Current theme mode (true = dark, false = light)
 * - onThemeToggle: Callback to toggle theme mode
 * - isDropdownOpen: Project dropdown open state (optional)
 * - onDropdownToggle: Callback when dropdown is toggled (optional)
 *
 * Special considerations:
 * - Logo is SVG with colorful books design
 * - Theme toggle shows sun icon in dark mode, moon in light mode
 * - Settings link navigates to /admin page
 * - All buttons have hover effects for better UX
 */
interface NavigationProps {
  projects: Project[];
  currentProject: Project | null;
  onProjectSelect: (project: Project) => void;
  darkMode: boolean;
  onThemeToggle: () => void;
  isDropdownOpen?: boolean;
  onDropdownToggle?: (open: boolean) => void;
}

export function Navigation({
  projects,
  currentProject,
  onProjectSelect,
  darkMode,
  onThemeToggle,
  isDropdownOpen,
  onDropdownToggle
}: NavigationProps) {
  return (
    <nav className="h-14 flex items-center justify-between px-6" style={{ backgroundColor: 'var(--surface-nav)' }}>
      <div className="flex items-center space-x-6 flex-1">
        {/* Book Logo SVG */}
        <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="8" width="12" height="20" rx="1" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1" />
          <line x1="8" y1="10" x2="8" y2="26" stroke="#3b82f6" strokeWidth="0.5" opacity="0.5" />

          <rect x="16" y="6" width="12" height="22" rx="1" fill="#34d399" stroke="#10b981" strokeWidth="1" />
          <line x1="22" y1="8" x2="22" y2="26" stroke="#10b981" strokeWidth="0.5" opacity="0.5" />

          <rect x="30" y="7" width="12" height="21" rx="1" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
          <line x1="36" y1="9" x2="36" y2="26" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5" />

          <rect x="44" y="9" width="12" height="19" rx="1" fill="#f87171" stroke="#ef4444" strokeWidth="1" />
          <line x1="50" y1="11" x2="50" y2="26" stroke="#ef4444" strokeWidth="0.5" opacity="0.5" />

          <rect x="58" y="5" width="12" height="23" rx="1" fill="#a78bfa" stroke="#8b5cf6" strokeWidth="1" />
          <line x1="64" y1="7" x2="64" y2="26" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.5" />
        </svg>

        {/* Project Selector */}
        <ProjectSelector
          projects={projects}
          currentProject={currentProject}
          onSelect={onProjectSelect}
          isOpen={isDropdownOpen}
          onToggle={onDropdownToggle}
        />
      </div>

      {/* Theme Toggle and Settings */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onThemeToggle}
          className="p-2 rounded focus:outline-none focus:ring-2"
          style={{
            transition: 'background-color 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-nav-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <i
            className={`fas fa-${darkMode ? 'sun' : 'moon'} text-xl`}
            style={{ color: 'var(--icon-primary)' }}
          ></i>
        </button>
        <a
          href="/admin"
          className="p-2 rounded focus:outline-none focus:ring-2 inline-block"
          style={{
            transition: 'background-color 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-nav-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <i
            className="fas fa-cog text-xl"
            style={{ color: 'var(--icon-primary)' }}
          ></i>
        </a>
      </div>
    </nav>
  );
}
