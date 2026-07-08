interface AdminSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const SECTIONS = [
  { id: 'projects', label: 'Projects', icon: 'fa-layer-group' },
  { id: 'settings', label: 'Settings', icon: 'fa-cog' },
];

export function AdminSidebar({ activeSection = 'projects', onSectionChange }: AdminSidebarProps) {
  return (
    <div
      className="w-64 min-h-[calc(100vh-4rem)]"
      style={{
        backgroundColor: 'var(--surface-panel)',
        borderRight: '1px solid var(--border-primary)'
      }}
    >
      <nav className="p-4">
        <ul className="space-y-2">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => onSectionChange?.(section.id)}
                className="flex items-center w-full px-4 py-2 rounded-md text-left"
                style={{
                  color: activeSection === section.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                  backgroundColor: activeSection === section.id ? 'var(--accent-secondary)' : 'transparent',
                }}
              >
                <i className={`fas ${section.icon} mr-3`}></i>
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
