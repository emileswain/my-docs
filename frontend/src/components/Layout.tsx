import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from './common/Navigation';
import { FileTree } from './FileTree';
import { FileViewer } from './FileViewer';
import { StructureTree } from './StructureTree';
import { NotePanel } from './NotePanel';
import { useProjectStore } from '../store/useProjectStore';
import { useAppStore } from '../store/useAppStore';
import { useProjects } from '../hooks/useProjects';
import { useFileContent } from '../hooks/useFileContent';
import { loadOpenFoldersFromStorage } from '../store/useProjectStore';
import type { ProjectGroup, SubProject } from '../types';

export function Layout() {
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);
  const { groupSlug, subSlug, '*': filePath } = useParams();
  const navigate = useNavigate();
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const historyLoadCallbackRef = useRef<((content: string) => void) | null>(null);

  const { groups, loadGroups } = useProjects();
  const { loadFile } = useFileContent();

  const currentGroup = useProjectStore((state) => state.currentGroup);
  const currentSubProject = useProjectStore((state) => state.currentSubProject);
  const setCurrentGroup = useProjectStore((state) => state.setCurrentGroup);
  const setCurrentSubProject = useProjectStore((state) => state.setCurrentSubProject);
  const setOpenFolders = useProjectStore((state) => state.setOpenFolders);

  const darkMode = useAppStore((state) => state.darkMode);
  const setDarkMode = useAppStore((state) => state.setDarkMode);
  const notesPanelVisible = useAppStore((state) => state.notesPanelVisible);
  const notesPanelPosition = useAppStore((state) => state.notesPanelPosition);

  // Load groups on mount
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Handle group/sub-project selection from URL or localStorage
  useEffect(() => {
    if (groups.length === 0) return;

    if (groupSlug) {
      const group = groups.find((g) => g.slug === groupSlug);

      if (group) {
        if (group.id !== currentGroup?.id) {
          setCurrentGroup(group);
        }

        if (subSlug) {
          const sub = group.subprojects.find((sp) => sp.slug === subSlug);
          if (sub && sub.id !== currentSubProject?.id) {
            selectSubProject(sub, false);
          }
        } else if (group.id !== currentGroup?.id) {
          const savedSubId = localStorage.getItem('currentSubProjectId');
          const savedSub = savedSubId ? group.subprojects.find((sp) => sp.id === savedSubId) : null;
          const sub = savedSub || group.subprojects[0];
          if (sub) {
            selectSubProject(sub);
          }
        }
      } else {
        for (const g of groups) {
          const sub = g.subprojects.find((sp) => sp.slug === groupSlug);
          if (sub) {
            setCurrentGroup(g);
            selectSubProject(sub, false);
            navigate(`/${g.slug}/${sub.slug}${filePath ? `/${filePath}` : ''}`, { replace: true });
            return;
          }
        }
      }
    } else if (!currentGroup) {
      const savedGroupId = localStorage.getItem('currentGroupId');
      const savedSubId = localStorage.getItem('currentSubProjectId');

      if (savedGroupId) {
        const group = groups.find((g) => g.id === savedGroupId);
        if (group) {
          setCurrentGroup(group);
          const sub = savedSubId
            ? group.subprojects.find((sp) => sp.id === savedSubId) || group.subprojects[0]
            : group.subprojects[0];
          if (sub) {
            selectSubProject(sub);
          }
        }
      }
    }
  }, [groups, groupSlug, subSlug]);

  // Handle file selection from URL or localStorage
  useEffect(() => {
    if (!currentSubProject) return;

    if (filePath) {
      const fullPath = `${currentSubProject.path}/${filePath}`;
      const fileName = filePath.split('/').pop() || '';
      loadFileWithoutUrlUpdate(fullPath, fileName);
    } else {
      const savedFile = localStorage.getItem('currentFile');
      if (savedFile && savedFile.startsWith(currentSubProject.path)) {
        const fileName = savedFile.split('/').pop() || '';
        loadFileWithoutUrlUpdate(savedFile, fileName);
      }
    }
  }, [currentSubProject, filePath, loadFile]);

  const selectGroup = (group: ProjectGroup) => {
    setCurrentGroup(group);
    setIsGroupDropdownOpen(false);

    const savedSubId = localStorage.getItem('currentSubProjectId');
    const savedSub = savedSubId ? group.subprojects.find((sp) => sp.id === savedSubId) : null;
    const sub = savedSub || group.subprojects[0];

    if (sub) {
      selectSubProject(sub, true, group);
    } else {
      navigate(`/${group.slug}`);
    }
  };

  const selectSubProject = (sub: SubProject, updateUrl = true, group?: ProjectGroup) => {
    setCurrentSubProject(sub);
    setIsSubDropdownOpen(false);

    const openFolders = loadOpenFoldersFromStorage(sub.id);
    setOpenFolders(sub.id, openFolders);

    if (updateUrl) {
      const g = group || currentGroup;
      if (g) {
        navigate(`/${g.slug}/${sub.slug}`);
      }
    }
  };

  const loadFileWithoutUrlUpdate = async (path: string, name: string) => {
    try {
      await loadFile(path, name);
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const handleFileSelect = useCallback(async (path: string, name: string) => {
    try {
      await loadFile(path, name);

      if (currentGroup && currentSubProject) {
        const relativePath = path.replace(`${currentSubProject.path}/`, '');
        navigate(`/${currentGroup.slug}/${currentSubProject.slug}/${relativePath}`);
      }
    } catch (error) {
      console.error('Error loading file:', error);
    }
  }, [loadFile, currentGroup, currentSubProject, navigate]);

  const handleHistoryLoad = useCallback((callback: (content: string) => void) => {
    historyLoadCallbackRef.current = callback;
  }, []);

  const handleLoadHistory = useCallback((content: string) => {
    if (historyLoadCallbackRef.current) {
      historyLoadCallbackRef.current(content);
    }
  }, []);

  const notePanelElement = notesPanelVisible && (
    <NotePanel
      contentAreaRef={contentAreaRef}
    />
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation */}
      <Navigation
        groups={groups}
        currentGroup={currentGroup}
        currentSubProject={currentSubProject}
        onGroupSelect={selectGroup}
        onSubProjectSelect={(sub) => selectSubProject(sub)}
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode(!darkMode)}
        isGroupDropdownOpen={isGroupDropdownOpen}
        onGroupDropdownToggle={setIsGroupDropdownOpen}
        isSubDropdownOpen={isSubDropdownOpen}
        onSubDropdownToggle={setIsSubDropdownOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <FileTree onFileSelect={handleFileSelect} />

        {/* Center column — splits vertically when notes are at bottom */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <FileViewer
            contentAreaRef={contentAreaRef}
            onHistoryLoad={handleHistoryLoad}
            onNavigate={handleFileSelect}

          />
          {notesPanelVisible && notesPanelPosition === 'bottom' && notePanelElement}
        </div>

        {/* Right side: structure tree or notes panel */}
        {notesPanelVisible && notesPanelPosition === 'right' ? (
          notePanelElement
        ) : (
          <StructureTree
            contentAreaRef={contentAreaRef}
            onLoadHistory={handleLoadHistory}
          />
        )}
      </div>
    </div>
  );
}
