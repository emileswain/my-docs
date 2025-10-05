import { useStore } from '../store/useStore';
import { FileViewerHeader } from './FileViewerHeader';
import { MarkdownViewer } from './viewers/MarkdownViewer';
import { JsonViewer } from './viewers/JsonViewer';
import { YamlViewer } from './viewers/YamlViewer';
import { RawViewer } from './viewers/RawViewer';
import { useScrollPosition } from '../hooks/useScrollPosition';

interface FileViewerProps {
  contentAreaRef: React.RefObject<HTMLDivElement | null>;
}

export function FileViewer({ contentAreaRef }: FileViewerProps) {
  const currentFile = useStore((state) => state.currentFile);
  const currentFileName = useStore((state) => state.currentFileName);
  const currentFileContent = useStore((state) => state.currentFileContent);
  const showRaw = useStore((state) => state.showRaw);
  const setShowRaw = useStore((state) => state.setShowRaw);
  const currentHeading = useStore((state) => state.currentHeading);
  const setCurrentHeading = useStore((state) => state.setCurrentHeading);

  const extension = currentFile ? currentFile.substring(currentFile.lastIndexOf('.')).toLowerCase() : '';
  const isMarkdown = extension === '.md' && !!currentFileContent?.html;
  const isJson = extension === '.json';
  const isYaml = extension === '.yml' || extension === '.yaml';
  const canToggleRaw = isMarkdown || isJson || isYaml;

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

    return <RawViewer content={currentFileContent.content} />;
  };

  return (
    <div className="flex-1 bg-white flex flex-col min-w-0">
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
