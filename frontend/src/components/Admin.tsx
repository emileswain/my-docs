import { useState, useEffect } from 'react';
import type { ProjectGroup, SubProject } from '../types';
import type { CreateGroupDto, CreateSubProjectDto, UpdateSubProjectDto } from '../services/projectService';
import { useProjects } from '../hooks/useProjects';
import { Modal } from './common/Modal';
import { AdminHeader } from './admin/AdminHeader';
import { AdminSidebar } from './admin/AdminSidebar';
import { SubProjectCard } from './admin/SubProjectCard';
import { SubProjectForm } from './admin/SubProjectForm';
import { GroupForm } from './admin/GroupForm';

export function Admin() {
  const { groups, loadGroups, createGroup, updateGroup, deleteGroup, createSubProject, updateSubProject, deleteSubProject } = useProjects();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'group' | 'subproject'>('group');
  const [editingGroup, setEditingGroup] = useState<ProjectGroup | null>(null);
  const [editingSubProject, setEditingSubProject] = useState<{ groupId: string; sub: SubProject } | null>(null);
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Auto-expand all groups on first load
  useEffect(() => {
    if (groups.length > 0 && expandedGroups.size === 0) {
      setExpandedGroups(new Set(groups.map(g => g.id)));
    }
  }, [groups]);

  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Group actions
  const openAddGroupModal = () => {
    setEditingGroup(null);
    setModalMode('group');
    setIsModalOpen(true);
  };

  const openEditGroupModal = (group: ProjectGroup) => {
    setEditingGroup(group);
    setModalMode('group');
    setIsModalOpen(true);
  };

  const handleGroupSubmit = async (data: CreateGroupDto) => {
    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, data);
      } else {
        await createGroup(data);
      }
      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save group';
      alert(message);
    }
  };

  const handleDeleteGroup = async (group: ProjectGroup) => {
    if (!confirm(`Are you sure you want to delete "${group.title}" and all its sub-projects?`)) {
      return;
    }
    try {
      await deleteGroup(group.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete group';
      alert(message);
    }
  };

  // Sub-project actions
  const openAddSubProjectModal = (groupId: string) => {
    setEditingSubProject(null);
    setTargetGroupId(groupId);
    setModalMode('subproject');
    setIsModalOpen(true);
  };

  const openEditSubProjectModal = (groupId: string, sub: SubProject) => {
    setEditingSubProject({ groupId, sub });
    setTargetGroupId(groupId);
    setModalMode('subproject');
    setIsModalOpen(true);
  };

  const handleSubProjectSubmit = async (data: CreateSubProjectDto | UpdateSubProjectDto) => {
    try {
      if (editingSubProject) {
        await updateSubProject(editingSubProject.groupId, editingSubProject.sub.id, data);
      } else if (targetGroupId) {
        await createSubProject(targetGroupId, data as CreateSubProjectDto);
      }
      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save sub-project';
      alert(message);
    }
  };

  const handleDeleteSubProject = async (groupId: string, sub: SubProject) => {
    if (!confirm(`Are you sure you want to delete "${sub.title}"?`)) {
      return;
    }
    try {
      await deleteSubProject(groupId, sub.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete sub-project';
      alert(message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
    setEditingSubProject(null);
    setTargetGroupId(null);
  };

  const getModalTitle = () => {
    if (modalMode === 'group') {
      return editingGroup ? 'Edit Group' : 'Add Group';
    }
    return editingSubProject ? 'Edit Sub-project' : 'Add Sub-project';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminHeader />

      <div className="flex">
        <AdminSidebar activeSection="projects" />

        <div className="flex-1 p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Project Groups</h2>
            <button
              onClick={openAddGroupModal}
              className="px-4 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
                borderColor: 'var(--border-focus)',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
            >
              <i className="fas fa-plus mr-2"></i>
              Add Group
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-layer-group text-6xl mb-4" style={{ color: 'var(--text-tertiary)' }}></i>
              <p style={{ color: 'var(--text-secondary)' }}>
                No project groups yet. Add your first group to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-lg shadow-sm overflow-hidden"
                  style={{
                    backgroundColor: 'var(--surface-panel)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {/* Group Header */}
                  <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer"
                    style={{
                      borderBottom: expandedGroups.has(group.id) ? '1px solid var(--border-primary)' : 'none',
                    }}
                    onClick={() => toggleGroupExpanded(group.id)}
                  >
                    <div className="flex items-center gap-3">
                      <i
                        className={`fas fa-chevron-${expandedGroups.has(group.id) ? 'down' : 'right'} text-xs`}
                        style={{ color: 'var(--text-tertiary)', width: '12px' }}
                      ></i>
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {group.title}
                      </h3>
                      <span
                        className="px-2 py-0.5 text-xs rounded"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {group.subprojects.length} sub-project{group.subprojects.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openAddSubProjectModal(group.id)}
                        className="px-3 py-1.5 text-sm rounded-md"
                        style={{
                          color: 'var(--accent-primary)',
                          backgroundColor: 'var(--accent-secondary)',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
                        title="Add sub-project"
                      >
                        <i className="fas fa-plus mr-1"></i>
                        Add
                      </button>
                      <button
                        onClick={() => openEditGroupModal(group)}
                        className="p-2 rounded-md transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-panel-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Edit Group"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group)}
                        className="p-2 rounded-md transition-colors"
                        style={{ color: 'var(--color-red-600)' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-red-50)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Delete Group"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  {/* Sub-projects */}
                  {expandedGroups.has(group.id) && (
                    <div className="p-4 space-y-3">
                      {group.subprojects.length === 0 ? (
                        <p className="text-sm italic py-4 text-center" style={{ color: 'var(--text-tertiary)' }}>
                          No sub-projects in this group yet.
                        </p>
                      ) : (
                        group.subprojects.map((sub) => (
                          <SubProjectCard
                            key={sub.id}
                            subProject={sub}
                            groupSlug={group.slug}
                            onEdit={() => openEditSubProjectModal(group.id, sub)}
                            onDelete={() => handleDeleteSubProject(group.id, sub)}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={getModalTitle()}
      >
        {modalMode === 'group' ? (
          <GroupForm
            group={editingGroup}
            onSubmit={handleGroupSubmit}
            onCancel={closeModal}
          />
        ) : (
          <SubProjectForm
            subProject={editingSubProject?.sub}
            onSubmit={handleSubProjectSubmit}
            onCancel={closeModal}
          />
        )}
      </Modal>
    </div>
  );
}
