/**
 * AdminSidebar - Left navigation sidebar for admin panel
 *
 * Purpose:
 * - Provides navigation menu for different admin sections
 * - Currently only shows Projects section
 * - Extensible for future admin sections (Settings, Users, etc.)
 *
 * Used by:
 * - Admin component (left side of admin layout)
 *
 * Props:
 * - activeSection: Currently active section (default: 'projects')
 *
 * Special considerations:
 * - Fixed width (w-64) for consistent layout
 * - Full height to fill admin page
 * - Active section highlighted with accent colors
 * - Future-ready for additional navigation items
 */
interface AdminSidebarProps {
  activeSection?: string;
}

export function AdminSidebar({ activeSection = 'projects' }: AdminSidebarProps) {
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
          <li>
            <a
              href="#"
              className="flex items-center px-4 py-2 rounded-md"
              style={{
                color: activeSection === 'projects' ? 'var(--accent-primary)' : 'var(--text-primary)',
                backgroundColor: activeSection === 'projects' ? 'var(--accent-secondary)' : 'transparent'
              }}
            >
              <i className="fas fa-folder mr-3"></i>
              Projects
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
