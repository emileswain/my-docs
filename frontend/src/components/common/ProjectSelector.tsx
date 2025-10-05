import { Dropdown } from './Dropdown';
import type { Project } from '../../types';

/**
 * ProjectSelector - Project selection dropdown component
 *
 * Purpose:
 * - Displays current project and allows switching between projects
 * - Shows project title and description in dropdown list
 * - Integrates with generic Dropdown component for UI
 *
 * Used by:
 * - Navigation component (top nav bar)
 *
 * Props:
 * - projects: Array of available projects
 * - currentProject: Currently selected project (null if none)
 * - onSelect: Callback when a project is selected
 * - isOpen: Controlled open state (optional)
 * - onToggle: Callback when dropdown is toggled (optional)
 *
 * Special considerations:
 * - Displays "Select Project" when no project is selected
 * - Shows "No projects available" message when projects array is empty
 * - Hover effects on project items for better UX
 */
interface ProjectSelectorProps {
  projects: Project[];
  currentProject: Project | null;
  onSelect: (project: Project) => void;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export function ProjectSelector({
  projects,
  currentProject,
  onSelect,
  isOpen,
  onToggle
}: ProjectSelectorProps) {
  const trigger = (
    <button
      className="px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2"
      style={{
        backgroundColor: 'var(--surface-nav-hover)',
        borderColor: 'var(--border-secondary)',
        color: 'var(--icon-primary)',
        border: '1px solid'
      }}
    >
      <i className="fas fa-folder mr-2 text-xs"></i>
      <span>{currentProject?.title || 'Select Project'}</span>
      <i className="fas fa-chevron-down ml-2 text-xs"></i>
    </button>
  );

  return (
    <Dropdown
      trigger={trigger}
      isOpen={isOpen}
      onToggle={onToggle}
      className="w-64 max-h-60 overflow-y-auto"
    >
      <div className="py-1">
        {projects.length === 0 ? (
          <p className="px-4 py-2 italic text-sm" style={{ color: 'var(--text-tertiary)' }}>
            No projects available
          </p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="px-4 py-2 cursor-pointer"
              style={{
                transition: 'background-color 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-panel-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => onSelect(project)}
            >
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {project.title}
              </div>
              {project.description && (
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Dropdown>
  );
}
