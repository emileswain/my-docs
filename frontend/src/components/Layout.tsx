import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileTree } from './FileTree';
import { FileViewer } from './FileViewer';
import { StructureTree } from './StructureTree';
import { useStore } from '../store/useStore';
import { fetchProjects, fetchFileContent } from '../services/api';
import { loadOpenFoldersFromStorage } from '../store/useStore';

export function Layout() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const projects = useStore((state) => state.projects);
  const currentProject = useStore((state) => state.currentProject);
  const setProjects = useStore((state) => state.setProjects);
  const setCurrentProject = useStore((state) => state.setCurrentProject);
  const setCurrentFile = useStore((state) => state.setCurrentFile);
  const setOpenFolders = useStore((state) => state.setOpenFolders);

  // Load projects on mount
  useEffect(() => {
    loadProjectsData();
  }, []);

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

  const loadProjectsData = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const selectProject = async (project: typeof projects[0], updateUrl = true) => {
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
      const content = await fetchFileContent(path);
      setCurrentFile(path, name, content);
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    document.addEventListener('click', closeDropdown);
    return () => {
      document.removeEventListener('click', closeDropdown);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-slate-800 h-14 flex items-center justify-between px-6">
        <div className="flex items-center space-x-6 flex-1">
          {/* Book Logo SVG */}
          <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="8" width="12" height="20" rx="1" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1" />
            <line x1="8" y1="10" x2="8" y2="26" stroke="#3b82f6" strokeWidth="0.5" opacity="0.5" />

            <rect x="16" y="6" width="12" height="22" rx="1" fill="#34d399" stroke="#10b981" strokeWidth="1" />
            <line x1="22" y1="8" x2="22" y2="26" stroke="#10b981" strokeWidth="0.5" opacity="0.5" />

            <rect x="30" y="7" width="12" height="21" rx="1" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <line x1="36" y1="9" x2="36" y2="26" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5" />

            <rect x="44" y="9" width="12" height="19" rx="1" fill="#f87171" stroke="#ef4444" strokeWidth="1" />
            <line x1="50" y1="11" x2="50" y2="26" stroke="#ef4444" strokeWidth="0.5" opacity="0.5" />

            <rect x="58" y="5" width="12" height="23" rx="1" fill="#a78bfa" stroke="#8b5cf6" strokeWidth="1" />
            <line x1="64" y1="7" x2="64" y2="26" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.5" />
          </svg>

          {/* Project Dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm font-medium text-slate-200 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <i className="fas fa-folder mr-2 text-xs"></i>
              <span>{currentProject?.title || 'Select Project'}</span>
              <i className="fas fa-chevron-down ml-2 text-xs"></i>
            </button>
            {isDropdownOpen && (
              <div
                className="absolute z-10 mt-1 w-64 bg-white shadow-lg rounded border border-gray-200 max-h-60 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  {projects.length === 0 ? (
                    <p className="px-4 py-2 text-gray-400 italic text-sm">No projects available</p>
                  ) : (
                    projects.map((project) => (
                      <div
                        key={project.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectProject(project)}
                      >
                        <div className="text-sm font-semibold text-gray-800">{project.title}</div>
                        {project.description && (
                          <div className="text-xs text-gray-500">{project.description}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Icon */}
        <div>
          <a
            href="/admin"
            className="p-2 rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 inline-block"
          >
            <i className="fas fa-cog text-xl text-slate-300 hover:text-white"></i>
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <FileTree onFileSelect={handleFileSelect} />
        <FileViewer />
        <StructureTree />
      </div>
    </div>
  );
}
