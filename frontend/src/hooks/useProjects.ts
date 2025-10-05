import { useCallback } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { projectService } from '../services/projectService';
import type { CreateProjectDto, UpdateProjectDto } from '../services/projectService';

export function useProjects() {
  const projects = useProjectStore((state) => state.projects);
  const setProjects = useProjectStore((state) => state.setProjects);
  const addProject = useProjectStore((state) => state.addProject);
  const updateProjectInStore = useProjectStore((state) => state.updateProject);
  const removeProjectFromStore = useProjectStore((state) => state.removeProject);

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectService.fetchProjects();
      setProjects(data);
      return data;
    } catch (error) {
      console.error('Error loading projects:', error);
      throw error;
    }
  }, [setProjects]);

  const createProject = useCallback(async (data: CreateProjectDto) => {
    try {
      const project = await projectService.createProject(data);
      addProject(project);
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }, [addProject]);

  const updateProject = useCallback(async (id: string, data: UpdateProjectDto) => {
    try {
      const project = await projectService.updateProject(id, data);
      updateProjectInStore(project);
      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }, [updateProjectInStore]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await projectService.deleteProject(id);
      removeProjectFromStore(id);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }, [removeProjectFromStore]);

  return {
    projects,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
