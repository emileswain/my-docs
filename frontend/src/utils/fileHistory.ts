/**
 * File History Management
 *
 * Stores file save history in localStorage with timestamps and content snapshots.
 * Keeps last 10 saves per file for easy restoration.
 */

export interface FileHistoryEntry {
  timestamp: number;
  content: string;
}

const MAX_HISTORY_PER_FILE = 10;
const HISTORY_KEY_PREFIX = 'file_history_';

/**
 * Generate storage key for a file
 */
function getHistoryKey(projectId: string, filePath: string): string {
  // Normalize path to be consistent
  const normalizedPath = filePath.replace(/^\//, '');
  return `${HISTORY_KEY_PREFIX}${projectId}_${normalizedPath}`;
}

/**
 * Get history for a file
 */
export function getFileHistory(projectId: string, filePath: string): FileHistoryEntry[] {
  const key = getHistoryKey(projectId, filePath);
  const stored = localStorage.getItem(key);

  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse file history:', error);
    return [];
  }
}

/**
 * Add a new entry to file history
 */
export function addToFileHistory(
  projectId: string,
  filePath: string,
  content: string
): void {
  const key = getHistoryKey(projectId, filePath);
  const history = getFileHistory(projectId, filePath);

  const newEntry: FileHistoryEntry = {
    timestamp: Date.now(),
    content,
  };

  // Add to beginning of array
  history.unshift(newEntry);

  // Keep only last MAX_HISTORY_PER_FILE entries
  const trimmedHistory = history.slice(0, MAX_HISTORY_PER_FILE);

  localStorage.setItem(key, JSON.stringify(trimmedHistory));
}

/**
 * Clear history for a file
 */
export function clearFileHistory(projectId: string, filePath: string): void {
  const key = getHistoryKey(projectId, filePath);
  localStorage.removeItem(key);
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isThisYear) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
