import { useEffect } from 'react';
import { useStore } from '../../store/useStore';

interface MarkdownViewerProps {
  html: string;
  contentAreaRef: React.RefObject<HTMLDivElement | null>;
  onHeadingChange: (heading: string) => void;
  currentFile: string | null;
}

export function MarkdownViewer({ html, contentAreaRef, onHeadingChange, currentFile }: MarkdownViewerProps) {
  const darkMode = useStore((state) => state.darkMode);
  useEffect(() => {
    if (contentAreaRef.current) {
      setupHeaderTracking();
      setupCopyButtons();

      return () => {
        const contentArea = contentAreaRef.current;
        if (contentArea) {
          const scrollHandler = (contentArea as any).__scrollHandler;
          if (scrollHandler) {
            contentArea.removeEventListener('scroll', scrollHandler);
          }
        }
      };
    }
  }, [html]);

  const setupHeaderTracking = () => {
    const markdownContent = contentAreaRef.current?.querySelector('#markdownContent');
    const contentArea = contentAreaRef.current;

    if (!markdownContent || !contentArea) {
      return;
    }

    const updateCurrentHeading = () => {
      const contentAreaRect = contentArea.getBoundingClientRect();
      const headingsAbove: Element[] = [];

      const currentHeadings = markdownContent.querySelectorAll('h1, h2, h3, h4, h5, h6');

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

  return (
    <div
      id="markdownContent"
      className={`prose ${darkMode ? 'prose-invert' : 'prose-slate'} max-w-none`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
