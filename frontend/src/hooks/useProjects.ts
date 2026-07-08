import { useCallback } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { projectService } from '../services/projectService';
import type { CreateGroupDto, UpdateGroupDto, CreateSubProjectDto, UpdateSubProjectDto } from '../services/projectService';

export function useProjects() {
  const groups = useProjectStore((state) => state.groups);
  const setGroups = useProjectStore((state) => state.setGroups);
  const addGroupToStore = useProjectStore((state) => state.addGroup);
  const updateGroupInStore = useProjectStore((state) => state.updateGroup);
  const removeGroupFromStore = useProjectStore((state) => state.removeGroup);
  const addSubProjectToStore = useProjectStore((state) => state.addSubProject);
  const updateSubProjectInStore = useProjectStore((state) => state.updateSubProject);
  const removeSubProjectFromStore = useProjectStore((state) => state.removeSubProject);

  const loadGroups = useCallback(async () => {
    try {
      const data = await projectService.fetchGroups();
      setGroups(data);
      return data;
    } catch (error) {
      console.error('Error loading groups:', error);
      throw error;
    }
  }, [setGroups]);

  const createGroup = useCallback(async (data: CreateGroupDto) => {
    try {
      const group = await projectService.createGroup(data);
      addGroupToStore(group);
      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }, [addGroupToStore]);

  const updateGroup = useCallback(async (id: string, data: UpdateGroupDto) => {
    try {
      const group = await projectService.updateGroup(id, data);
      updateGroupInStore(group);
      return group;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }, [updateGroupInStore]);

  const deleteGroup = useCallback(async (id: string) => {
    try {
      await projectService.deleteGroup(id);
      removeGroupFromStore(id);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }, [removeGroupFromStore]);

  const createSubProject = useCallback(async (groupId: string, data: CreateSubProjectDto) => {
    try {
      const sub = await projectService.createSubProject(groupId, data);
      addSubProjectToStore(groupId, sub);
      return sub;
    } catch (error) {
      console.error('Error creating sub-project:', error);
      throw error;
    }
  }, [addSubProjectToStore]);

  const updateSubProject = useCallback(async (groupId: string, subId: string, data: UpdateSubProjectDto) => {
    try {
      const sub = await projectService.updateSubProject(groupId, subId, data);
      updateSubProjectInStore(groupId, sub);
      return sub;
    } catch (error) {
      console.error('Error updating sub-project:', error);
      throw error;
    }
  }, [updateSubProjectInStore]);

  const deleteSubProject = useCallback(async (groupId: string, subId: string) => {
    try {
      await projectService.deleteSubProject(groupId, subId);
      removeSubProjectFromStore(groupId, subId);
    } catch (error) {
      console.error('Error deleting sub-project:', error);
      throw error;
    }
  }, [removeSubProjectFromStore]);

  return {
    groups,
    loadGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    createSubProject,
    updateSubProject,
    deleteSubProject,
  };
}
