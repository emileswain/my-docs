import type { Project } from '../../types';

/**
 * ProjectCard - Displays a single project in card format
 *
 * Purpose:
 * - Shows project information (title, description, slug, path)
 * - Provides action buttons (view, edit, delete)
 * - Consistent card UI with hover effects
 *
 * Used by:
 * - Admin component (projects list view)
 *
 * Props:
 * - project: The project to display
 * - onEdit: Callback when edit button is clicked
 * - onDelete: Callback when delete button is clicked
 *
 * Special considerations:
 * - View link navigates to main viewer with project slug as query param
 * - Path is displayed in a code-styled box
 * - Slug is shown as a badge next to title
 * - All action buttons have hover effects and tooltips
 */
interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div
      className="rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
      style={{
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-primary)'
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {project.title}
            </h3>
            <span
              className="px-2 py-1 text-xs rounded"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}
            >
              {project.slug}
            </span>
          </div>
          {project.description && (
            <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
              {project.description}
            </p>
          )}
          <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center">
              <i className="fas fa-folder mr-2" style={{ color: 'var(--text-tertiary)' }}></i>
              <code
                className="px-2 py-1 rounded"
                style={{ backgroundColor: 'var(--code-bg)' }}
              >
                {project.path}
              </code>
            </div>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <a
            href={`/?project=${project.slug}`}
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--accent-primary)' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="View Project"
          >
            <i className="fas fa-eye"></i>
          </a>
          <button
            onClick={() => onEdit(project)}
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-panel-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Edit Project"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={() => onDelete(project)}
            className="p-2 rounded-md transition-colors"
            style={{ color: 'var(--color-red-600)' }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-red-50)';
            }}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Delete Project"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
