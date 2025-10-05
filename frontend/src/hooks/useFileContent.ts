import { useState, useCallback } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { fileService } from '../services/fileService';

/**
 * useFileContent - Custom hook for loading and managing file content
 *
 * Purpose:
 * - Loads individual file content from the API
 * - Manages loading state for file operations
 * - Updates ProjectStore with current file data
 *
 * Used by:
 * - Layout component (for handling file selection)
 *
 * Returns:
 * - currentFile: Path of currently loaded file
 * - currentFileName: Name of currently loaded file
 * - currentFileContent: Full content object (includes tree, content, html, type)
 * - isLoading: Boolean indicating if file is being loaded
 * - loadFile: Function to load a file by path and name
 * - clearFile: Function to clear current file selection
 *
 * Special considerations:
 * - Loading state is local to this hook (not in store)
 * - File content includes parsed tree structure and HTML (for markdown)
 * - Throws errors on failure - caller should handle with try/catch
 * - Updates are persisted to localStorage via ProjectStore
 */
export function useFileContent() {
  const [isLoading, setIsLoading] = useState(false);

  const currentFile = useProjectStore((state) => state.currentFile);
  const currentFileName = useProjectStore((state) => state.currentFileName);
  const currentFileContent = useProjectStore((state) => state.currentFileContent);
  const setCurrentFile = useProjectStore((state) => state.setCurrentFile);

  const loadFile = useCallback(async (path: string, name: string) => {
    setIsLoading(true);
    try {
      const content = await fileService.fetchFileContent(path);
      setCurrentFile(path, name, content);
      return content;
    } catch (error) {
      console.error('Error loading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentFile]);

  const clearFile = useCallback(() => {
    setCurrentFile(null, null, null);
  }, [setCurrentFile]);

  return {
    currentFile,
    currentFileName,
    currentFileContent,
    isLoading,
    loadFile,
    clearFile,
  };
}
