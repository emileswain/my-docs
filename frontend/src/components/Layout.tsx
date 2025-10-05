import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileTree } from './FileTree';
import { FileViewer } from './FileViewer';
import { StructureTree } from './StructureTree';
import { useProjectStore } from '../store/useProjectStore';
import { useAppStore } from '../store/useAppStore';
import { useProjects } from '../hooks/useProjects';
import { useFileContent } from '../hooks/useFileContent';
import { loadOpenFoldersFromStorage } from '../store/useProjectStore';

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
      await loadFile(path, name);
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
      <nav className="h-14 flex items-center justify-between px-6" style={{ backgroundColor: 'var(--surface-nav)' }}>
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
              className="px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--surface-nav-hover)',
                borderColor: 'var(--border-secondary)',
                color: 'var(--icon-primary)',
                border: '1px solid'
              }}
            >
              <i className="fas fa-folder mr-2 text-xs"></i>
              <span>{currentProject?.title || 'Select Project'}</span>
              <i className="fas fa-chevron-down ml-2 text-xs"></i>
            </button>
            {isDropdownOpen && (
              <div
                className="absolute z-10 mt-1 w-64 shadow-lg rounded max-h-60 overflow-y-auto"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-primary)',
                  border: '1px solid'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  {projects.length === 0 ? (
                    <p className="px-4 py-2 italic text-sm" style={{ color: 'var(--text-tertiary)' }}>No projects available</p>
                  ) : (
                    projects.map((project) => (
                      <div
                        key={project.id}
                        className="px-4 py-2 cursor-pointer"
                        style={{
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-panel-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => selectProject(project)}
                      >
                        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{project.title}</div>
                        {project.description && (
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{project.description}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Theme Toggle and Settings */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded focus:outline-none focus:ring-2"
            style={{
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-nav-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <i
              className={`fas fa-${darkMode ? 'sun' : 'moon'} text-xl`}
              style={{ color: 'var(--icon-primary)' }}
            ></i>
          </button>
          <a
            href="/admin"
            className="p-2 rounded focus:outline-none focus:ring-2 inline-block"
            style={{
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-nav-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <i
              className="fas fa-cog text-xl"
              style={{ color: 'var(--icon-primary)' }}
            ></i>
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <FileTree onFileSelect={handleFileSelect} />
        <FileViewer contentAreaRef={contentAreaRef} />
        <StructureTree contentAreaRef={contentAreaRef} />
      </div>
    </div>
  );
}
