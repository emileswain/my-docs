import type { SubProject } from '../../types';
import { SUBPROJECT_TYPE_ICONS } from '../../types';

interface SubProjectIconBarProps {
  subprojects: SubProject[];
  currentSubProject: SubProject | null;
  onSelect: (sub: SubProject) => void;
}

export function SubProjectIconBar({
  subprojects,
  currentSubProject,
  onSelect,
}: SubProjectIconBarProps) {
  if (subprojects.length <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      {subprojects.map((sub) => {
        const isActive = currentSubProject?.id === sub.id;
        return (
          <button
            key={sub.id}
            onClick={() => onSelect(sub)}
            className="relative p-2 rounded focus:outline-none focus:ring-2"
            style={{
              color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              transition: 'color 0.15s, background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--surface-nav-hover)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={sub.title}
          >
            <i className={`fas ${SUBPROJECT_TYPE_ICONS[sub.type]} text-sm`}></i>
            {isActive && (
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
