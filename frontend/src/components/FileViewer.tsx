import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

interface FileViewerProps {
  contentAreaRef: React.RefObject<HTMLDivElement | null>;
}

export function FileViewer({ contentAreaRef }: FileViewerProps) {
  const currentFile = useStore((state) => state.currentFile);
  const currentFileName = useStore((state) => state.currentFileName);
  const currentFileContent = useStore((state) => state.currentFileContent);
  const showRaw = useStore((state) => state.showRaw);
  const setShowRaw = useStore((state) => state.setShowRaw);
  const setCurrentHeading = useStore((state) => state.setCurrentHeading);
  const currentHeading = useStore((state) => state.currentHeading);
  const scrollHandlerRef = useRef<(() => void) | null>(null);

  const extension = currentFile ? currentFile.substring(currentFile.lastIndexOf('.')).toLowerCase() : '';
  const isMarkdown = extension === '.md' && currentFileContent?.html;

  useEffect(() => {
    if (isMarkdown && !showRaw && contentAreaRef.current) {
      addCopyButtonsToCodeBlocks();
      setupHeaderTracking();
    }

    return () => {
      // Cleanup scroll handler
      if (scrollHandlerRef.current && contentAreaRef.current) {
        contentAreaRef.current.removeEventListener('scroll', scrollHandlerRef.current);
      }
    };
  }, [currentFileContent, showRaw, isMarkdown]);

  // Save and restore scroll position
  useEffect(() => {
    if (currentFile && contentAreaRef.current) {
      const savedScroll = localStorage.getItem('scrollPosition');
      if (savedScroll) {
        setTimeout(() => {
          if (contentAreaRef.current) {
            contentAreaRef.current.scrollTop = parseInt(savedScroll);
          }
        }, 150);
      }
    }
  }, [currentFile]);

  const setupHeaderTracking = () => {
    const markdownContent = contentAreaRef.current?.querySelector('#markdownContent');
    if (!markdownContent || !contentAreaRef.current) return;

    const headings = markdownContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) return;

    // Remove old scroll listener
    if (scrollHandlerRef.current && contentAreaRef.current) {
      contentAreaRef.current.removeEventListener('scroll', scrollHandlerRef.current);
    }

    const updateCurrentHeading = () => {
      if (!contentAreaRef.current) return;

      const contentAreaRect = contentAreaRef.current.getBoundingClientRect();
      const contentAreaTop = contentAreaRect.top;

      let current = null as HTMLElement | null;

      Array.from(headings).forEach((heading) => {
        const headingRect = heading.getBoundingClientRect();
        if (headingRect.top <= contentAreaTop + 100) {
          current = heading as HTMLElement;
        }
      });

      if (current) {
        setCurrentHeading(current.textContent ?? '');
      }
    };

    let scrollTimeout: number;
    scrollHandlerRef.current = () => {
      // Save scroll position
      if (currentFile && contentAreaRef.current) {
        localStorage.setItem('scrollPosition', String(contentAreaRef.current.scrollTop));
      }

      // Update current heading with debounce
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = window.setTimeout(updateCurrentHeading, 50);
    };

    contentAreaRef.current.addEventListener('scroll', scrollHandlerRef.current);
    updateCurrentHeading();
  };

  const addCopyButtonsToCodeBlocks = () => {
    const markdownContent = contentAreaRef.current?.querySelector('#markdownContent');
    if (!markdownContent) return;

    const codeBlocks = markdownContent.querySelectorAll('pre');

    codeBlocks.forEach((pre) => {
      // Skip if already has a copy button
      if (pre.parentElement?.classList.contains('code-block-wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';

      const button = document.createElement('button');
      button.className = 'copy-code-btn';
      button.textContent = 'Copy';
      button.onclick = () => copyCode(button);

      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(button);
      wrapper.appendChild(pre);
    });
  };

  const copyCode = (button: HTMLButtonElement) => {
    const wrapper = button.parentElement;
    const pre = wrapper?.querySelector('pre');
    const code = pre?.querySelector('code') || pre;

    if (!code) return;

    const text = code.textContent || '';

    navigator.clipboard.writeText(text).then(
      () => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');

        setTimeout(() => {
          button.textContent = originalText || 'Copy';
          button.classList.remove('copied');
        }, 2000);
      },
      (err) => {
        console.error('Failed to copy code:', err);
        button.textContent = 'Failed';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      }
    );
  };

  const toggleView = () => {
    setShowRaw(!showRaw);
  };

  const renderContent = () => {
    if (!currentFileContent) return null;

    if (showRaw) {
      return (
        <pre className="bg-gray-50 p-4 rounded overflow-x-auto max-w-full">
          <code>{currentFileContent.content}</code>
        </pre>
      );
    }

    if (extension === '.md' && currentFileContent.html) {
      return (
        <div
          id="markdownContent"
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: currentFileContent.html }}
        />
      );
    }

    if (extension === '.json') {
      try {
        const formatted = JSON.stringify(JSON.parse(currentFileContent.content), null, 2);
        return (
          <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
            <code className="language-json">{formatted}</code>
          </pre>
        );
      } catch {
        return (
          <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
            <code>{currentFileContent.content}</code>
          </pre>
        );
      }
    }

    return (
      <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
        <code>{currentFileContent.content}</code>
      </pre>
    );
  };

  return (
    <div className="flex-1 bg-white flex flex-col min-w-0">
      {/* Fixed Header Bar */}
      <div className="border-b border-gray-200 px-6 bg-gray-50" style={{ height: '60px' }}>
        <div className="flex items-center justify-between h-full">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold truncate text-gray-800">
              {currentFileName || ''}
            </h2>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {currentHeading}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            {isMarkdown && (
              <button
                onClick={toggleView}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
              >
                <i className={`fas fa-${showRaw ? 'eye' : 'code'} mr-1`}></i>
                {showRaw ? 'Show Rendered' : 'Show Raw'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div
        ref={contentAreaRef}
        className="flex-1 overflow-y-auto p-6"
      >
        {!currentFile ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <i className="fas fa-file-alt text-6xl mb-4"></i>
              <p>Select a file to view its structure</p>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}
