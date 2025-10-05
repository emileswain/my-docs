import { useProjectStore } from '../store/useProjectStore';
import { useAppStore } from '../store/useAppStore';
import { FileViewerHeader } from './FileViewerHeader';
import { MarkdownViewer } from './viewers/MarkdownViewer';
import { JsonViewer } from './viewers/JsonViewer';
import { YamlViewer } from './viewers/YamlViewer';
import { MermaidViewer } from './viewers/MermaidViewer';
import { RawViewer } from './viewers/RawViewer';
import { useScrollPosition } from '../hooks/useScrollPosition';

interface FileViewerProps {
  contentAreaRef: React.RefObject<HTMLDivElement | null>;
}

export function FileViewer({ contentAreaRef }: FileViewerProps) {
  const currentFile = useProjectStore((state) => state.currentFile);
  const currentFileName = useProjectStore((state) => state.currentFileName);
  const currentFileContent = useProjectStore((state) => state.currentFileContent);

  const showRaw = useAppStore((state) => state.showRaw);
  const setShowRaw = useAppStore((state) => state.setShowRaw);
  const currentHeading = useAppStore((state) => state.currentHeading);
  const setCurrentHeading = useAppStore((state) => state.setCurrentHeading);

  const darkMode = useAppStore((state) => state.darkMode);

  const extension = currentFile ? currentFile.substring(currentFile.lastIndexOf('.')).toLowerCase() : '';
  const isMarkdown = extension === '.md' && !!currentFileContent?.html;
  const isJson = extension === '.json';
  const isYaml = extension === '.yml' || extension === '.yaml';
  const isMermaid = extension === '.mmd';
  const canToggleRaw = isMarkdown || isJson || isYaml || isMermaid;

  useScrollPosition(currentFile, contentAreaRef);

  const toggleView = () => {
    setShowRaw(!showRaw);
  };

  const renderContent = () => {
    if (!currentFileContent) return null;

    if (showRaw) {
      return <RawViewer content={currentFileContent.content} />;
    }

    if (isMarkdown && currentFileContent.html) {
      return (
        <MarkdownViewer
          html={currentFileContent.html}
          contentAreaRef={contentAreaRef}
          onHeadingChange={setCurrentHeading}
          currentFile={currentFile}
        />
      );
    }

    if (isJson) {
      return <JsonViewer content={currentFileContent.content} />;
    }

    if (isYaml) {
      return <YamlViewer content={currentFileContent.content} />;
    }

    if (isMermaid) {
      return (
        <div style={{ height: '100%', width: '100%' }}>
          <MermaidViewer content={currentFileContent.content} darkMode={darkMode} />
        </div>
      );
    }

    return <RawViewer content={currentFileContent.content} />;
  };

  return (
    <div
      className="flex-1 flex flex-col min-w-0"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <FileViewerHeader
        fileName={currentFileName || ''}
        currentHeading={currentHeading}
        canToggleRaw={canToggleRaw}
        showRaw={showRaw}
        onToggleRaw={toggleView}
      />

      <div
        ref={contentAreaRef}
        className="flex-1 overflow-y-auto p-6"
      >
        {!currentFile ? (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: 'var(--text-tertiary)' }}
          >
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
