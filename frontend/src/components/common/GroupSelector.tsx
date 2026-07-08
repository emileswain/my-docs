import { Dropdown } from './Dropdown';
import type { ProjectGroup } from '../../types';

interface GroupSelectorProps {
  groups: ProjectGroup[];
  currentGroup: ProjectGroup | null;
  onSelect: (group: ProjectGroup) => void;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export function GroupSelector({
  groups,
  currentGroup,
  onSelect,
  isOpen,
  onToggle,
}: GroupSelectorProps) {
  const trigger = (
    <button
      className="px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2"
      style={{
        backgroundColor: 'var(--surface-nav-hover)',
        borderColor: 'var(--border-secondary)',
        color: 'var(--icon-primary)',
        border: '1px solid',
      }}
    >
      <i className="fas fa-layer-group mr-2 text-xs"></i>
      <span>{currentGroup?.title || 'Select Project'}</span>
      <i className="fas fa-chevron-down ml-2 text-xs"></i>
    </button>
  );

  return (
    <Dropdown
      trigger={trigger}
      isOpen={isOpen}
      onToggle={onToggle}
      className="w-56 max-h-60 overflow-y-auto"
    >
      <div className="py-1">
        {groups.length === 0 ? (
          <p className="px-4 py-2 italic text-sm" style={{ color: 'var(--text-tertiary)' }}>
            No projects available
          </p>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="px-4 py-2 cursor-pointer"
              style={{
                transition: 'background-color 0.15s',
                backgroundColor: currentGroup?.id === group.id ? 'var(--surface-panel-hover)' : 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-panel-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentGroup?.id === group.id ? 'var(--surface-panel-hover)' : 'transparent'}
              onClick={() => onSelect(group)}
            >
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {group.title}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {group.subprojects.length} sub-project{group.subprojects.length !== 1 ? 's' : ''}
              </div>
            </div>
          ))
        )}
      </div>
    </Dropdown>
  );
}
