import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const contentAreaRef = useRef<HTMLDivElement>(null);

  const { projects, loadProjects } = useProjects();
  const { loadFile } = useFileContent();

  const currentProject = useProjectStore((state) => state.currentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const setCurrentFile = useProjectStore((state) => state.setCurrentFile);
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

    const projectParam = searchParams.get('project');

    if (projectParam) {
      const project = projects.find((p) => p.slug === projectParam || p.id === projectParam);
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
  }, [projects, searchParams]);

  // Restore previously selected file when project loads
  useEffect(() => {
    if (!currentProject) return;

    const savedFile = localStorage.getItem('currentFile');
    if (savedFile && savedFile.startsWith(currentProject.path)) {
      const fileName = savedFile.split('/').pop() || '';
      handleFileSelect(savedFile, fileName);
    }
  }, [currentProject]);

  const selectProject = async (project: Project, updateUrl = true) => {
    setCurrentProject(project);
    setIsDropdownOpen(false);

    // Load open folders from localStorage
    const openFolders = loadOpenFoldersFromStorage(project.id);
    setOpenFolders(project.id, openFolders);

    if (updateUrl) {
      setSearchParams({ project: project.slug });
    }
  };

  const handleFileSelect = async (path: string, name: string) => {
    try {
      await loadFile(path, name);
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

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
        <FileViewer contentAreaRef={contentAreaRef} />
        <StructureTree contentAreaRef={contentAreaRef} />
      </div>
    </div>
  );
}
