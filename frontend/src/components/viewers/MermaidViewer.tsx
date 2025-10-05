import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

/**
 * MermaidViewer - Renders Mermaid diagrams
 *
 * Purpose:
 * - Displays Mermaid diagrams from .mmd files or markdown code blocks
 * - Supports interactive features (zoom, pan)
 * - Handles dark mode theming
 *
 * Used by:
 * - FileViewer component (for .mmd files)
 * - MarkdownViewer component (for mermaid code blocks)
 *
 * Props:
 * - content: Mermaid diagram source code
 * - darkMode: Whether dark mode is enabled
 * - interactive: Whether to enable zoom/pan (default: true)
 *
 * Special considerations:
 * - Mermaid is initialized with theme based on darkMode
 * - Each diagram gets a unique ID to avoid conflicts
 * - Re-renders when content or theme changes
 */
interface MermaidViewerProps {
  content: string;
  darkMode?: boolean;
  interactive?: boolean;
}

export function MermaidViewer({ content, darkMode = false, interactive = true }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Initialize mermaid with theme
    mermaid.initialize({
      startOnLoad: false,
      theme: darkMode ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'monospace',
    });

    const renderDiagram = async () => {
      if (!content || !containerRef.current) return;

      try {
        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substring(7)}`;

        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(id, content);
        setSvg(renderedSvg);
        setError('');
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };

    renderDiagram();
  }, [content, darkMode]);

  if (error) {
    return (
      <div
        className="p-4 rounded"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--color-red-600)',
          border: '1px solid var(--color-red-600)'
        }}
      >
        <strong>Mermaid Error:</strong>
        <pre className="mt-2 text-sm" style={{ color: 'var(--text-primary)' }}>
          {error}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-container ${interactive ? 'interactive' : ''}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        minHeight: '200px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '0.5rem',
        overflow: interactive ? 'auto' : 'hidden'
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
