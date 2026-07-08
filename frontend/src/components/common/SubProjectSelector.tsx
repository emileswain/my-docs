import { Dropdown } from './Dropdown';
import type { SubProject } from '../../types';
import { SUBPROJECT_TYPE_ICONS } from '../../types';

interface SubProjectSelectorProps {
  subprojects: SubProject[];
  currentSubProject: SubProject | null;
  onSelect: (sub: SubProject) => void;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export function SubProjectSelector({
  subprojects,
  currentSubProject,
  onSelect,
  isOpen,
  onToggle,
}: SubProjectSelectorProps) {
  const trigger = (
    <button
      className="px-3 py-1.5 rounded text-base font-semibold focus:outline-none focus:ring-2 flex items-center"
      style={{
        color: 'var(--text-primary)',
        transition: 'color 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
    >
      <span>{currentSubProject?.title || 'Select Sub-project'}</span>
      <i className="fas fa-chevron-down ml-2 text-xs" style={{ color: 'var(--text-tertiary)' }}></i>
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
        {subprojects.length === 0 ? (
          <p className="px-4 py-2 italic text-sm" style={{ color: 'var(--text-tertiary)' }}>
            No sub-projects
          </p>
        ) : (
          subprojects.map((sub) => (
            <div
              key={sub.id}
              className="px-4 py-2 cursor-pointer flex items-center gap-2"
              style={{
                transition: 'background-color 0.15s',
                backgroundColor: currentSubProject?.id === sub.id ? 'var(--surface-panel-hover)' : 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-panel-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentSubProject?.id === sub.id ? 'var(--surface-panel-hover)' : 'transparent'}
              onClick={() => onSelect(sub)}
            >
              <i
                className={`fas ${SUBPROJECT_TYPE_ICONS[sub.type]} text-xs w-4 text-center`}
                style={{ color: 'var(--text-tertiary)' }}
              ></i>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {sub.title}
                </div>
                {sub.description && (
                  <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                    {sub.description}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Dropdown>
  );
}
