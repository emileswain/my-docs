import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css';

interface EditableRawViewerProps {
  content: string;
  filePath: string;
  onSave: (content: string) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
}

export interface EditableRawViewerRef {
  loadHistoricalContent: (historicalContent: string) => void;
  cancelHistoryView: () => void;
  triggerSave: () => void;
}

export const EditableRawViewer = forwardRef<EditableRawViewerRef, EditableRawViewerProps>(
  ({ content, filePath, onSave, onDirtyChange }, ref) => {
    const [code, setCode] = useState(content);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isViewingHistory, setIsViewingHistory] = useState(false);
    const [originalContent, setOriginalContent] = useState(content);

    // Reset when content or file changes
    useEffect(() => {
      setCode(content);
      setOriginalContent(content);
      setIsDirty(false);
      setIsViewingHistory(false);
    }, [content, filePath]);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      loadHistoricalContent: (historicalContent: string) => {
        setCode(historicalContent);
        setIsViewingHistory(true);
        setIsDirty(true);
      },
      cancelHistoryView: () => {
        setCode(originalContent);
        setIsViewingHistory(false);
        setIsDirty(false);
      },
      triggerSave: () => {
        handleSave();
      },
    }));

    // Notify parent of dirty state changes
    useEffect(() => {
      onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    const handleChange = (newCode: string) => {
      setCode(newCode);
      setIsDirty(newCode !== originalContent);
      // No longer viewing unmodified history if user edits
      if (isViewingHistory && newCode !== code) {
        setIsViewingHistory(false);
      }
    };

    const handleSave = async () => {
      if (!isDirty || isSaving) return;

      setIsSaving(true);
      try {
        await onSave(code);
        setOriginalContent(code);
        setIsDirty(false);
        setIsViewingHistory(false);
      } catch (error) {
        console.error('Failed to save:', error);
        // Keep dirty state on error
      } finally {
        setIsSaving(false);
      }
    };

    const handleCancel = () => {
      setCode(originalContent);
      setIsDirty(false);
      setIsViewingHistory(false);
    };

    // Handle keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          handleSave();
        }
        if (e.key === 'Escape' && isViewingHistory) {
          e.preventDefault();
          handleCancel();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDirty, code, originalContent, isViewingHistory]);

    // Determine language for syntax highlighting
    const getLanguage = () => {
      const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
      if (ext === '.md') return languages.markdown;
      if (ext === '.json') return languages.json;
      if (ext === '.yaml' || ext === '.yml') return languages.yaml;
      return languages.markdown; // default
    };

    return (
      <div
        className="h-full flex flex-col"
        style={{
          backgroundColor: 'var(--code-bg)',
          position: 'relative'
        }}
      >
        {/* History view banner */}
        {isViewingHistory && (
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--accent-secondary)',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
              <i className="fas fa-history" style={{ marginRight: 8 }}></i>
              Viewing historical version
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: '4px 12px',
                  fontSize: 12,
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.6 : 1
                }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                style={{
                  padding: '4px 12px',
                  fontSize: 12,
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 4,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.6 : 1
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Editor */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Editor
            value={code}
            onValueChange={handleChange}
            highlight={(code) => highlight(code, getLanguage(), 'markdown')}
            padding={16}
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: 14,
              lineHeight: 1.5,
              minHeight: '100%',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--code-bg)',
            }}
            textareaClassName="focus:outline-none"
          />
        </div>

        {/* Saving indicator */}
        {isSaving && !isViewingHistory && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              padding: '4px 8px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 4,
              fontSize: 12,
              color: 'var(--text-secondary)'
            }}
          >
            Saving...
          </div>
        )}
      </div>
    );
  }
);

EditableRawViewer.displayName = 'EditableRawViewer';
