import { useState, useCallback } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { fileService } from '../services/fileService';

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
