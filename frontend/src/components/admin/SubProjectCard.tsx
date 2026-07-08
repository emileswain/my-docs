import type { SubProject } from '../../types';
import { SUBPROJECT_TYPE_ICONS } from '../../types';

interface SubProjectCardProps {
  subProject: SubProject;
  groupSlug: string;
  onEdit: () => void;
  onDelete: () => void;
  onWatches?: () => void;
}

export function SubProjectCard({ subProject, groupSlug, onEdit, onDelete, onWatches }: SubProjectCardProps) {
  return (
    <div
      className="rounded-md px-5 py-3 flex items-center justify-between"
      style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-secondary)',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-primary)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-secondary)'}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <i
          className={`fas ${SUBPROJECT_TYPE_ICONS[subProject.type]} text-lg`}
          style={{ color: 'var(--accent-primary)', width: '20px', textAlign: 'center' }}
        ></i>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {subProject.title}
            </span>
            <span
              className="px-1.5 py-0.5 text-xs rounded"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-tertiary)',
              }}
            >
              {subProject.type}
            </span>
          </div>
          <code
            className="text-xs block truncate mt-0.5"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {subProject.path}
          </code>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-3 flex-shrink-0">
        <a
          href={`/${groupSlug}/${subProject.slug}`}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: 'var(--accent-primary)' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title="View"
        >
          <i className="fas fa-eye text-sm"></i>
        </a>
        {onWatches && (
          <button
            onClick={onWatches}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--accent-primary)' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Watches"
          >
            <i className="fas fa-binoculars text-sm"></i>
          </button>
        )}
        <button
          onClick={onEdit}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-panel-hover)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Edit"
        >
          <i className="fas fa-edit text-sm"></i>
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: 'var(--color-red-600)' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-red-50)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Delete"
        >
          <i className="fas fa-trash text-sm"></i>
        </button>
      </div>
    </div>
  );
}
