import { useState, useEffect, useCallback, useRef, type RefObject } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { useAppStore } from '../store/useAppStore';
import {
  getDocumentNotes,
  addDocumentNote,
  updateDocumentNote,
  deleteDocumentNote,
  exportNotesAsMarkdown,
  type DocumentNote,
} from '../utils/documentNotes';
import { Dropdown } from './common/Dropdown';

interface NotePanelProps {
  contentAreaRef: RefObject<HTMLDivElement | null>;
}

export function NotePanel({ contentAreaRef }: NotePanelProps) {
  const [notes, setNotes] = useState<DocumentNote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const currentFile = useProjectStore((state) => state.currentFile);
  const currentFileName = useProjectStore((state) => state.currentFileName);
  const currentSubProject = useProjectStore((state) => state.currentSubProject);
  const notesPanelPosition = useAppStore((state) => state.notesPanelPosition);
  const setNotesPanelVisible = useAppStore((state) => state.setNotesPanelVisible);
  const setNotesPanelPosition = useAppStore((state) => state.setNotesPanelPosition);

  const projectId = currentSubProject?.id || '';

  // Load notes when file changes — try backend first, fall back to localStorage
  useEffect(() => {
    if (projectId && currentFile) {
      const localNotes = getDocumentNotes(projectId, currentFile);

      // Try loading from backend
      fetch(`/api/notes/${currentFile.replace(/^\//, '')}`)
        .then(r => r.json())
        .then(data => {
          const backendNotes = data.notes || [];
          // Use whichever has more notes (simple merge strategy)
          const loaded = backendNotes.length >= localNotes.length ? backendNotes : localNotes;
          setNotes(loaded);
          setCurrentIndex(loaded.length > 0 ? loaded.length - 1 : 0);
        })
        .catch(() => {
          setNotes(localNotes);
          setCurrentIndex(localNotes.length > 0 ? localNotes.length - 1 : 0);
        });
    } else {
      setNotes([]);
      setCurrentIndex(0);
    }
  }, [projectId, currentFile]);

  const currentNote = notes[currentIndex] || null;

  const syncToBackend = useCallback((updatedNotes: DocumentNote[]) => {
    if (!currentFile) return;
    fetch(`/api/notes/${currentFile.replace(/^\//, '')}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: updatedNotes }),
    }).catch(() => { /* silent — localStorage is primary */ });
  }, [currentFile]);

  const handleAddNote = useCallback(() => {
    if (!projectId || !currentFile) return;

    // Read selection at click time to avoid interfering with text selection gestures
    let quote = '';
    let title = 'Untitled';
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && contentAreaRef.current) {
      const anchor = sel.anchorNode;
      if (anchor && contentAreaRef.current.contains(anchor)) {
        quote = sel.toString().trim();

        // Find nearest preceding heading
        let node: Node | null = sel.anchorNode;
        while (node && node !== contentAreaRef.current) {
          if (node instanceof HTMLElement) {
            if (/^H[1-6]$/.test(node.tagName)) {
              title = node.textContent || title;
              break;
            }
            let prev = node.previousElementSibling;
            while (prev) {
              if (/^H[1-6]$/.test(prev.tagName)) {
                title = prev.textContent || title;
                break;
              }
              prev = prev.previousElementSibling;
            }
            if (title !== 'Untitled') break;
          }
          node = node.parentNode;
        }
      }
    }

    const note = addDocumentNote(projectId, currentFile, quote, title);
    const updated = [...notes, note];
    setNotes(updated);
    setCurrentIndex(updated.length - 1);
    syncToBackend(updated);
  }, [projectId, currentFile, contentAreaRef, notes, syncToBackend]);

  const debouncedSave = useCallback((noteId: string, updates: Partial<Pick<DocumentNote, 'title' | 'note'>>) => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (projectId && currentFile) {
        updateDocumentNote(projectId, currentFile, noteId, updates);
        const latest = getDocumentNotes(projectId, currentFile);
        syncToBackend(latest);
      }
    }, 400);
  }, [projectId, currentFile, syncToBackend]);

  const handleTitleChange = (value: string) => {
    if (!currentNote) return;
    setNotes(prev => prev.map((n, i) => i === currentIndex ? { ...n, title: value } : n));
    debouncedSave(currentNote.id, { title: value });
  };

  const handleNoteChange = (value: string) => {
    if (!currentNote) return;
    setNotes(prev => prev.map((n, i) => i === currentIndex ? { ...n, note: value } : n));
    debouncedSave(currentNote.id, { note: value });
  };

  const handleDelete = () => {
    if (!currentNote || !projectId || !currentFile) return;
    deleteDocumentNote(projectId, currentFile, currentNote.id);
    const updated = notes.filter((_, i) => i !== currentIndex);
    setNotes(updated);
    setCurrentIndex(Math.min(currentIndex, Math.max(0, updated.length - 1)));
    syncToBackend(updated);
  };

  const handleCopyAll = async () => {
    const md = exportNotesAsMarkdown(currentFileName || 'document', notes);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuoteClick = () => {
    if (!currentNote?.quote || !contentAreaRef.current) return;
    // Find and scroll to the quoted text in the document
    const walker = document.createTreeWalker(contentAreaRef.current, NodeFilter.SHOW_TEXT);
    const searchText = currentNote.quote.slice(0, 80); // use first 80 chars for matching
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent?.includes(searchText)) {
        const el = node.parentElement;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Brief highlight
          el.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
          setTimeout(() => { el.style.backgroundColor = ''; }, 2000);
        }
        break;
      }
    }
  };

  const togglePosition = () => {
    setNotesPanelPosition(notesPanelPosition === 'bottom' ? 'right' : 'bottom');
  };

  const isBottom = notesPanelPosition === 'bottom';

  const dropdownTrigger = (
    <button
      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium truncate"
      style={{
        color: 'var(--text-primary)',
        backgroundColor: 'var(--surface-nav-hover)',
        border: '1px solid var(--border-secondary)',
        maxWidth: '180px',
      }}
    >
      <span className="truncate">{currentNote?.title || 'No notes'}</span>
      <i className="fas fa-chevron-down text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
    </button>
  );

  return (
    <div
      className="flex flex-col"
      style={{
        backgroundColor: 'var(--surface-panel)',
        borderTop: isBottom ? '1px solid var(--border-primary)' : 'none',
        borderLeft: !isBottom ? '1px solid var(--border-primary)' : 'none',
        width: isBottom ? '100%' : '320px',
        height: isBottom ? '280px' : '100%',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 flex-shrink-0"
        style={{
          height: '40px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-tertiary)',
        }}
      >
        <i className="fas fa-sticky-note text-xs" style={{ color: 'var(--accent-primary)' }} />

        {/* Note selector dropdown */}
        {notes.length > 0 ? (
          <Dropdown
            trigger={dropdownTrigger}
            isOpen={dropdownOpen}
            onToggle={setDropdownOpen}
            className="w-56 max-h-48 overflow-y-auto"
          >
            <div className="py-1">
              {notes.map((n, i) => (
                <div
                  key={n.id}
                  className="px-3 py-1.5 cursor-pointer text-xs truncate"
                  style={{
                    backgroundColor: i === currentIndex ? 'var(--surface-panel-hover)' : 'transparent',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-panel-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = i === currentIndex ? 'var(--surface-panel-hover)' : 'transparent'}
                  onClick={() => { setCurrentIndex(i); setDropdownOpen(false); }}
                >
                  {n.title || 'Untitled'}
                </div>
              ))}
            </div>
          </Dropdown>
        ) : (
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No notes</span>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <button
          onClick={handleAddNote}
          className="p-1 rounded"
          style={{ color: 'var(--accent-primary)' }}
          title="Add note from selection"
        >
          <i className="fas fa-plus text-xs" />
        </button>

        {notes.length > 0 && (
          <button
            onClick={handleCopyAll}
            className="p-1 rounded"
            style={{ color: copied ? '#22c55e' : 'var(--text-secondary)' }}
            title="Copy all notes as markdown"
          >
            <i className={`fas fa-${copied ? 'check' : 'clipboard'} text-xs`} />
          </button>
        )}

        <button
          onClick={togglePosition}
          className="p-1 rounded"
          style={{ color: 'var(--text-tertiary)' }}
          title={isBottom ? 'Move to right side' : 'Move to bottom'}
        >
          <i className={`fas fa-${isBottom ? 'columns' : 'window-minimize'} text-xs`} />
        </button>

        <button
          onClick={() => setNotesPanelVisible(false)}
          className="p-1 rounded"
          style={{ color: 'var(--text-tertiary)' }}
          title="Close notes"
        >
          <i className="fas fa-times text-xs" />
        </button>
      </div>

      {/* Content */}
      {currentNote ? (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Quote */}
          {currentNote.quote && (
            <div
              className="px-3 py-2 cursor-pointer flex-shrink-0"
              style={{
                borderBottom: '1px solid var(--border-secondary)',
                backgroundColor: 'var(--bg-primary)',
              }}
              onClick={handleQuoteClick}
              title="Click to scroll to this passage"
            >
              <p
                className="text-xs italic"
                style={{
                  color: 'var(--text-tertiary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                <i className="fas fa-quote-left mr-1" style={{ fontSize: '8px' }} />
                {currentNote.quote}
              </p>
            </div>
          )}

          {/* Title */}
          <div className="px-3 pt-2 flex-shrink-0">
            <input
              type="text"
              value={currentNote.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Note title..."
              className="w-full px-2 py-1 rounded text-sm font-semibold focus:outline-none focus:ring-1"
              style={{
                border: '1px solid var(--border-secondary)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Note body */}
          <div className="px-3 pt-2 pb-3 flex-1 flex flex-col">
            <textarea
              value={currentNote.note}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Write your notes here..."
              className="w-full flex-1 px-2 py-1.5 rounded text-sm resize-none focus:outline-none focus:ring-1"
              style={{
                border: '1px solid var(--border-secondary)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                minHeight: '60px',
              }}
            />
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-3 py-1.5 flex-shrink-0"
            style={{
              borderTop: '1px solid var(--border-secondary)',
              backgroundColor: 'var(--bg-tertiary)',
            }}
          >
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {currentIndex + 1} of {notes.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="p-1 rounded"
                style={{ color: currentIndex === 0 ? 'var(--text-tertiary)' : 'var(--text-secondary)' }}
                title="Previous note"
              >
                <i className="fas fa-chevron-left text-xs" />
              </button>
              <button
                onClick={() => setCurrentIndex(Math.min(notes.length - 1, currentIndex + 1))}
                disabled={currentIndex >= notes.length - 1}
                className="p-1 rounded"
                style={{ color: currentIndex >= notes.length - 1 ? 'var(--text-tertiary)' : 'var(--text-secondary)' }}
                title="Next note"
              >
                <i className="fas fa-chevron-right text-xs" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 rounded ml-2"
                style={{ color: 'var(--color-red-600)' }}
                title="Delete note"
              >
                <i className="fas fa-trash text-xs" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-sticky-note text-3xl mb-2" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Select text in the document and click
            </p>
            <button
              onClick={handleAddNote}
              className="mt-2 px-3 py-1.5 rounded text-sm"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
              }}
            >
              <i className="fas fa-plus mr-1" />
              Add Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
