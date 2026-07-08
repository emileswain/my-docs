/**
 * Document Notes Management
 *
 * Stores per-file notes in localStorage. Each note has a title (auto-set from
 * nearest heading), a quote (selected text), and a free-form note body.
 */

export interface DocumentNote {
  id: string;
  title: string;
  note: string;
  quote: string;
  createdAt: number;
  updatedAt: number;
}

const NOTES_KEY_PREFIX = 'doc_notes_';

function getNotesKey(projectId: string, filePath: string): string {
  const normalizedPath = filePath.replace(/^\//, '');
  return `${NOTES_KEY_PREFIX}${projectId}_${normalizedPath}`;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function getDocumentNotes(projectId: string, filePath: string): DocumentNote[] {
  const key = getNotesKey(projectId, filePath);
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveDocumentNotes(projectId: string, filePath: string, notes: DocumentNote[]): void {
  const key = getNotesKey(projectId, filePath);
  localStorage.setItem(key, JSON.stringify(notes));
}

export function addDocumentNote(
  projectId: string,
  filePath: string,
  quote: string,
  title: string,
): DocumentNote {
  const notes = getDocumentNotes(projectId, filePath);
  const now = Date.now();
  const note: DocumentNote = {
    id: generateId(),
    title: title || 'Untitled',
    note: '',
    quote,
    createdAt: now,
    updatedAt: now,
  };
  notes.push(note);
  saveDocumentNotes(projectId, filePath, notes);
  return note;
}

export function updateDocumentNote(
  projectId: string,
  filePath: string,
  noteId: string,
  updates: Partial<Pick<DocumentNote, 'title' | 'note'>>,
): void {
  const notes = getDocumentNotes(projectId, filePath);
  const idx = notes.findIndex(n => n.id === noteId);
  if (idx === -1) return;
  if (updates.title !== undefined) notes[idx].title = updates.title;
  if (updates.note !== undefined) notes[idx].note = updates.note;
  notes[idx].updatedAt = Date.now();
  saveDocumentNotes(projectId, filePath, notes);
}

export function deleteDocumentNote(
  projectId: string,
  filePath: string,
  noteId: string,
): void {
  const notes = getDocumentNotes(projectId, filePath).filter(n => n.id !== noteId);
  saveDocumentNotes(projectId, filePath, notes);
}

export function exportNotesAsMarkdown(fileName: string, notes: DocumentNote[]): string {
  if (notes.length === 0) return '';

  const lines: string[] = [
    `# Notes: ${fileName}`,
    '',
    `_These are review notes from document "${fileName}", to process as feedback._`,
    '',
  ];

  for (const note of notes) {
    lines.push(`## ${note.title}`);
    lines.push('');
    if (note.quote) {
      lines.push(`> ${note.quote.replace(/\n/g, '\n> ')}`);
      lines.push('');
    }
    if (note.note) {
      lines.push(note.note);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}
