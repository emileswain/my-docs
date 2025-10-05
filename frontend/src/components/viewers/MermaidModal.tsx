import { MermaidViewer } from './MermaidViewer';

/**
 * MermaidModal - Fullscreen modal viewer for mermaid diagrams
 *
 * Purpose:
 * - Displays mermaid diagram in fullscreen overlay
 * - Provides top and bottom bars with close controls
 * - Enables interactive zoom/pan for detailed viewing
 *
 * Used by:
 * - MarkdownViewer component (when user clicks on a diagram)
 *
 * Props:
 * - content: Mermaid diagram source code
 * - darkMode: Whether dark mode is enabled
 * - onClose: Callback when modal is closed
 *
 * Special considerations:
 * - Fixed position overlay with high z-index (9999)
 * - Always renders diagram with interactive=true
 * - Two close options: X button in header and Close button in footer
 */
interface MermaidModalProps {
  content: string;
  darkMode: boolean;
  onClose: () => void;
}

export function MermaidModal({ content, darkMode, onClose }: MermaidModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-primary)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          padding: '1rem 2rem',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Mermaid Diagram</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem 1rem'
          }}
        >
          ✕
        </button>
      </div>

      {/* Diagram Area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MermaidViewer content={content} darkMode={darkMode} interactive={true} />
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          padding: '1rem 2rem',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-primary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem 2rem',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '0.25rem',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
