import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from './common/Navigation';
import { FileTree } from './FileTree';
import { FileViewer } from './FileViewer';
import { StructureTree } from './StructureTree';
import { useProjectStore } from '../store/useProjectStore';
import { useAppStore } from '../store/useAppStore';
import { useProjects } from '../hooks/useProjects';
import { useFileContent } from '../hooks/useFileContent';
import { loadOpenFoldersFromStorage } from '../store/useProjectStore';
import type { Project } from '../types';

export function Layout() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { projectSlug, '*': filePath } = useParams();
  const navigate = useNavigate();
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const historyLoadCallbackRef = useRef<((content: string) => void) | null>(null);

  const { projects, loadProjects } = useProjects();
  const { loadFile } = useFileContent();

  const currentProject = useProjectStore((state) => state.currentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const setOpenFolders = useProjectStore((state) => state.setOpenFolders);

  const darkMode = useAppStore((state) => state.darkMode);
  const setDarkMode = useAppStore((state) => state.setDarkMode);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Handle project selection from URL or localStorage
  useEffect(() => {
    if (projects.length === 0) return;

    if (projectSlug) {
      const project = projects.find((p) => p.slug === projectSlug || p.id === projectSlug);
      if (project && project.id !== currentProject?.id) {
        selectProject(project, false);
      }
    } else {
      const savedProjectId = localStorage.getItem('currentProjectId');
      if (savedProjectId && !currentProject) {
        const project = projects.find((p) => p.id === savedProjectId);
        if (project) {
          selectProject(project);
        }
      }
    }
  }, [projects, projectSlug]);

  // Handle file selection from URL or localStorage
  useEffect(() => {
    if (!currentProject) return;

    if (filePath) {
      // Construct full path from URL
      const fullPath = `${currentProject.path}/${filePath}`;
      const fileName = filePath.split('/').pop() || '';
      // Load file without updating URL (we're already at the URL)
      loadFileWithoutUrlUpdate(fullPath, fileName);
    } else {
      // Restore previously selected file from localStorage
      const savedFile = localStorage.getItem('currentFile');
      if (savedFile && savedFile.startsWith(currentProject.path)) {
        const fileName = savedFile.split('/').pop() || '';
        loadFileWithoutUrlUpdate(savedFile, fileName);
      }
    }
  }, [currentProject, filePath, loadFile]);

  const selectProject = async (project: Project, updateUrl = true) => {
    setCurrentProject(project);
    setIsDropdownOpen(false);

    // Load open folders from localStorage
    const openFolders = loadOpenFoldersFromStorage(project.id);
    setOpenFolders(project.id, openFolders);

    if (updateUrl) {
      navigate(`/${project.slug}`);
    }
  };

  const loadFileWithoutUrlUpdate = async (path: string, name: string) => {
    try {
      await loadFile(path, name);
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const handleFileSelect = async (path: string, name: string) => {
    try {
      await loadFile(path, name);

      // Update URL to reflect the selected file
      if (currentProject) {
        // Remove project path prefix to get relative path
        const relativePath = path.replace(`${currentProject.path}/`, '');
        navigate(`/${currentProject.slug}/${relativePath}`);
      }
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const handleHistoryLoad = useCallback((callback: (content: string) => void) => {
    historyLoadCallbackRef.current = callback;
  }, []);

  const handleLoadHistory = useCallback((content: string) => {
    if (historyLoadCallbackRef.current) {
      historyLoadCallbackRef.current(content);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation */}
      <Navigation
        projects={projects}
        currentProject={currentProject}
        onProjectSelect={selectProject}
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode(!darkMode)}
        isDropdownOpen={isDropdownOpen}
        onDropdownToggle={setIsDropdownOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <FileTree onFileSelect={handleFileSelect} />
        <FileViewer
          contentAreaRef={contentAreaRef}
          onHistoryLoad={handleHistoryLoad}
          onNavigate={handleFileSelect}
        />
        <StructureTree
          contentAreaRef={contentAreaRef}
          onLoadHistory={handleLoadHistory}
        />
      </div>
    </div>
  );
}
