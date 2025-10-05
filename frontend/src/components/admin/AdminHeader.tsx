/**
 * AdminHeader - Top navigation header for admin panel
 *
 * Purpose:
 * - Displays admin panel title/branding
 * - Provides back to viewer link
 * - Consistent header across all admin pages
 *
 * Used by:
 * - Admin component (top of admin layout)
 *
 * Props:
 * - title: Header title text (default: 'File Viewer Admin')
 *
 * Special considerations:
 * - Fixed height (h-16) for consistent layout
 * - Back button has hover effect for better UX
 * - Navigates to root path (/) for viewer
 */
interface AdminHeaderProps {
  title?: string;
}

export function AdminHeader({ title = 'File Viewer Admin' }: AdminHeaderProps) {
  return (
    <nav
      className="shadow-sm h-16 flex items-center justify-between px-6"
      style={{ backgroundColor: 'var(--surface-panel)' }}
    >
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
      </div>
      <a
        href="/"
        className="px-4 py-2 text-sm rounded-md"
        style={{ color: 'var(--text-primary)' }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-panel-hover)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <i className="fas fa-arrow-left mr-2"></i>
        Back to Viewer
      </a>
    </nav>
  );
}
