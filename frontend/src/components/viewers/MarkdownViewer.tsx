import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MermaidViewer } from './MermaidViewer';
import { MermaidModal } from './MermaidModal';

interface MarkdownViewerProps {
  html: string;
  contentAreaRef: React.RefObject<HTMLDivElement | null>;
  onHeadingChange: (heading: string) => void;
  currentFile: string | null;
  onNavigate?: (path: string, name: string) => void;
}

interface ProcessedContent {
  parts: Array<{ type: 'html' | 'mermaid'; content: string; id?: string }>;
}

export function MarkdownViewer({ html, contentAreaRef, onHeadingChange, currentFile, onNavigate }: MarkdownViewerProps) {
  const darkMode = useAppStore((state) => state.darkMode);
  const [fullscreenMermaid, setFullscreenMermaid] = useState<{ content: string; id: string } | null>(null);

  // Extract mermaid blocks and split HTML
  const processedContent = useMemo((): ProcessedContent => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const parts: ProcessedContent['parts'] = [];
    let currentHtml = '';

    const processNode = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        // Check if this is a code block with mermaid
        if (element.tagName === 'PRE') {
          const code = element.querySelector('code');
          if (code && code.className.includes('mermaid')) {
            // Save any accumulated HTML before this mermaid block
            if (currentHtml.trim()) {
              parts.push({ type: 'html', content: currentHtml });
              currentHtml = '';
            }

            // Add the mermaid block
            const mermaidContent = code.textContent || '';
            const id = `mermaid-${parts.length}`;
            parts.push({ type: 'mermaid', content: mermaidContent, id });
            return; // Don't process children
          }
        }

        // For other elements, add to current HTML
        currentHtml += element.outerHTML;
      } else if (node.nodeType === Node.TEXT_NODE) {
        currentHtml += node.textContent || '';
      }
    };

    // Process all body children
    Array.from(doc.body.childNodes).forEach(processNode);

    // Add any remaining HTML
    if (currentHtml.trim()) {
      parts.push({ type: 'html', content: currentHtml });
    }

    return { parts };
  }, [html]);

  useEffect(() => {
    if (contentAreaRef.current) {
      setupHeaderTracking();
      setupCopyButtons();
      setupLinkHandling();

      return () => {
        const contentArea = contentAreaRef.current;
        if (contentArea) {
          const scrollHandler = (contentArea as any).__scrollHandler;
          if (scrollHandler) {
            contentArea.removeEventListener('scroll', scrollHandler);
          }
          const linkHandler = (contentArea as any).__linkHandler;
          if (linkHandler) {
            contentArea.removeEventListener('click', linkHandler);
          }
        }
      };
    }
  }, [html, currentFile, onNavigate]);

  const setupHeaderTracking = () => {
    const contentArea = contentAreaRef.current;

    if (!contentArea) {
      return;
    }

    const updateCurrentHeading = () => {
      const contentAreaRect = contentArea.getBoundingClientRect();
      const headingsAbove: Element[] = [];

      const currentHeadings = contentArea.querySelectorAll('h1, h2, h3, h4, h5, h6');

      currentHeadings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        const isAbove = rect.top < contentAreaRect.top + 20;

        if (isAbove) {
          headingsAbove.push(heading);
        }
      });

      const lastHeadingAbove = headingsAbove[headingsAbove.length - 1];

      if (lastHeadingAbove) {
        onHeadingChange(lastHeadingAbove.textContent || '');
      } else {
        onHeadingChange('');
      }
    };

    // Remove old scroll listener
    const oldHandler = (contentArea as any).__scrollHandler;
    if (oldHandler) {
      contentArea.removeEventListener('scroll', oldHandler);
    }

    // Scroll handler with position saving
    const scrollHandler = () => {
      if (currentFile) {
        localStorage.setItem('scrollPosition', String(contentArea.scrollTop));
      }
      updateCurrentHeading();
    };

    (contentArea as any).__scrollHandler = scrollHandler;
    contentArea.addEventListener('scroll', scrollHandler);

    // Initial update
    updateCurrentHeading();
  };

  const setupCopyButtons = () => {
    const contentArea = contentAreaRef.current;
    if (!contentArea) return;

    const handleCopyClick = (e: Event) => {
      const target = e.target as HTMLElement;

      const pre = target.closest('pre');
      if (pre && target.classList.contains('copy-icon')) {
        e.preventDefault();
        e.stopPropagation();

        const code = pre.querySelector('code') || pre;
        const text = code.textContent || '';

        navigator.clipboard.writeText(text).then(
          () => {
            target.textContent = 'Copied';
            target.style.background = '#48bb78';
            setTimeout(() => {
              target.textContent = 'Copy';
              target.style.background = '';
            }, 2000);
          },
          (err) => {
            console.error('Failed to copy:', err);
          }
        );
      }
    };

    contentArea.addEventListener('click', handleCopyClick);
  };

  const setupLinkHandling = () => {
    const contentArea = contentAreaRef.current;
    if (!contentArea) return;

    // Remove old link handler
    const oldHandler = (contentArea as any).__linkHandler;
    if (oldHandler) {
      contentArea.removeEventListener('click', oldHandler);
    }

    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor || !onNavigate || !currentFile) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Check if it's an external link (has protocol)
      if (href.match(/^[a-z]+:\/\//i) || href.startsWith('mailto:')) {
        // Let external links open in new tab
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
        return;
      }

      // Check if it's a hash link (same page anchor)
      if (href.startsWith('#')) {
        return; // Let default behavior handle it
      }

      // It's a relative link - handle it
      e.preventDefault();
      e.stopPropagation();

      // Resolve the relative path
      const currentDir = currentFile.substring(0, currentFile.lastIndexOf('/'));
      let resolvedPath = href;

      // If href starts with /, it's relative to project root
      if (!href.startsWith('/')) {
        // Resolve relative to current directory
        const parts = currentDir.split('/');
        const hrefParts = href.split('/');

        for (const part of hrefParts) {
          if (part === '..') {
            parts.pop();
          } else if (part !== '.') {
            parts.push(part);
          }
        }

        resolvedPath = parts.join('/');
      }

      // Extract filename from path
      const fileName = resolvedPath.substring(resolvedPath.lastIndexOf('/') + 1);

      // Navigate to the new file
      onNavigate(resolvedPath, fileName);
    };

    (contentArea as any).__linkHandler = handleLinkClick;
    contentArea.addEventListener('click', handleLinkClick);
  };

  return (
    <div
      id="markdownContent"
      className={`prose ${darkMode ? 'prose-invert' : 'prose-slate'}`}
      style={{ maxWidth: '100%', width: '100%' }}
    >
      {processedContent.parts.map((part, index) => {
        if (part.type === 'mermaid') {
          const diagramId = part.id || `mermaid-${index}`;

          return (
            <div
              key={diagramId}
              className="my-8"
              style={{
                width: '100%',
                maxWidth: '800px',
                aspectRatio: '4 / 3',
                margin: '2rem auto',
                cursor: 'pointer'
              }}
              onClick={() => setFullscreenMermaid({ content: part.content, id: diagramId })}
            >
              <MermaidViewer content={part.content} darkMode={darkMode} interactive={false} />
            </div>
          );
        } else {
          return (
            <div
              key={index}
              dangerouslySetInnerHTML={{ __html: part.content }}
            />
          );
        }
      })}

      {/* Fullscreen Mermaid Modal */}
      {fullscreenMermaid && (
        <MermaidModal
          content={fullscreenMermaid.content}
          darkMode={darkMode}
          onClose={() => setFullscreenMermaid(null)}
        />
      )}
    </div>
  );
}
