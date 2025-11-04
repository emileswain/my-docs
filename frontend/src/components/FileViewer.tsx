import { useRef, useState, useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { useAppStore } from '../store/useAppStore';
import { FileViewerHeader } from './FileViewerHeader';
import { MarkdownViewer } from './viewers/MarkdownViewer';
import { JsonViewer } from './viewers/JsonViewer';
import { YamlViewer } from './viewers/YamlViewer';
import { MermaidViewer } from './viewers/MermaidViewer';
import { RawViewer } from './viewers/RawViewer';
import { EditableRawViewer, type EditableRawViewerRef } from './viewers/EditableRawViewer';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { fileService } from '../services/fileService';
import { addToFileHistory } from '../utils/fileHistory';

interface FileViewerProps {
  contentAreaRef: React.RefObject<HTMLDivElement | null>;
  onHistoryLoad?: (callback: (content: string) => void) => void;
}

export function FileViewer({ contentAreaRef, onHistoryLoad }: FileViewerProps) {
  const editorRef = useRef<EditableRawViewerRef>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentFile = useProjectStore((state) => state.currentFile);
  const currentFileName = useProjectStore((state) => state.currentFileName);
  const currentFileContent = useProjectStore((state) => state.currentFileContent);
  const currentProject = useProjectStore((state) => state.currentProject);

  const showRaw = useAppStore((state) => state.showRaw);
  const setShowRaw = useAppStore((state) => state.setShowRaw);
  const currentHeading = useAppStore((state) => state.currentHeading);
  const setCurrentHeading = useAppStore((state) => state.setCurrentHeading);

  const darkMode = useAppStore((state) => state.darkMode);

  // Expose history loading callback to parent
  useScrollPosition(currentFile, contentAreaRef);

  const handleLoadHistory = (content: string) => {
    editorRef.current?.loadHistoricalContent(content);
  };

  // Register callback with parent via effect
  useEffect(() => {
    if (onHistoryLoad) {
      onHistoryLoad(handleLoadHistory);
    }
  }, [onHistoryLoad]);

  const extension = currentFile ? currentFile.substring(currentFile.lastIndexOf('.')).toLowerCase() : '';
  const isMarkdown = extension === '.md' && !!currentFileContent?.html;
  const isJson = extension === '.json';
  const isYaml = extension === '.yml' || extension === '.yaml';
  const isMermaid = extension === '.mmd';
  const canToggleRaw = isMarkdown || isJson || isYaml || isMermaid;
  const canEdit = isMarkdown || isJson || isYaml; // Can edit markdown, json, yaml

  // Warn user about unsaved changes when navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && showRaw && canEdit) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, showRaw, canEdit]);

  const toggleView = () => {
    setShowRaw(!showRaw);
  };

  const handleSave = async (content: string) => {
    if (!currentFile || !currentProject) return;

    setIsSaving(true);
    try {
      await fileService.saveFile(currentFile, content);

      // Save to history
      addToFileHistory(currentProject.id, currentFile, content);

      // Exit edit mode after successful save
      setShowRaw(false);

      // TODO: Show success notification
      console.log('File saved successfully');
    } catch (error) {
      console.error('Failed to save file:', error);
      // TODO: Show error notification
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = () => {
    // Trigger save on the editor via ref
    editorRef.current?.triggerSave();
  };

  const renderContent = () => {
    if (!currentFileContent) return null;

    if (showRaw) {
      // Use editable viewer for markdown, json, yaml
      if (canEdit && currentFile) {
        return (
          <EditableRawViewer
            ref={editorRef}
            content={currentFileContent.content}
            filePath={currentFile}
            onSave={handleSave}
            onDirtyChange={setIsDirty}
          />
        );
      }
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
        isDirty={isDirty && showRaw && canEdit}
        isSaving={isSaving}
        onSave={handleSaveClick}
        canEdit={canEdit}
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
