import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import svgPanZoom from 'svg-pan-zoom';

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
 * - Interactive mode adds zoom/pan controls with mouse wheel and drag
 */
interface MermaidViewerProps {
  content: string;
  darkMode?: boolean;
  interactive?: boolean;
}

export function MermaidViewer({ content, darkMode = false, interactive = true }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panZoomRef = useRef<ReturnType<typeof svgPanZoom> | null>(null);
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

  // Initialize pan/zoom after SVG is rendered
  useEffect(() => {
    if (!svg || !interactive || !containerRef.current) return;

    // Wait for SVG to be in DOM
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    // Cleanup previous instance
    if (panZoomRef.current) {
      panZoomRef.current.destroy();
      panZoomRef.current = null;
    }

    // Remove max-width constraint from SVG
    svgElement.style.maxWidth = 'none';
    svgElement.style.width = '100%';
    svgElement.style.height = '100%';

    // Initialize svg-pan-zoom
    try {
      panZoomRef.current = svgPanZoom(svgElement, {
        zoomEnabled: true,
        controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 0.1,
        maxZoom: 10,
        zoomScaleSensitivity: 0.06,
      });
    } catch (err) {
      console.error('Failed to initialize pan/zoom:', err);
    }

    return () => {
      if (panZoomRef.current) {
        panZoomRef.current.destroy();
        panZoomRef.current = null;
      }
    };
  }, [svg, interactive]);

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
        minHeight: '100%',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        position: 'relative',
        border: interactive ? '2px solid var(--border-primary)' : 'none'
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
