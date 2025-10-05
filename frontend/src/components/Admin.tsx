import { useState, useEffect } from 'react';
import type { Project } from '../types';
import type { CreateProjectDto, UpdateProjectDto } from '../services/projectService';
import { useProjects } from '../hooks/useProjects';
import { Modal } from './common/Modal';
import { AdminHeader } from './admin/AdminHeader';
import { AdminSidebar } from './admin/AdminSidebar';
import { ProjectCard } from './admin/ProjectCard';
import { ProjectForm } from './admin/ProjectForm';

export function Admin() {
  const { projects, loadProjects, createProject, updateProject, deleteProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSubmit = async (data: CreateProjectDto | UpdateProjectDto) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
      } else {
        await createProject(data);
      }
      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save project';
      alert(message);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.title}"?`)) {
      return;
    }

    try {
      await deleteProject(project.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete project';
      alert(message);
    }
  };

  const openAddModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminHeader />

      {/* Main Content */}
      <div className="flex">
        <AdminSidebar activeSection="projects" />

        {/* Content Area */}
        <div className="flex-1 p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Projects</h2>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-md focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
                borderColor: 'var(--border-focus)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
            >
              <i className="fas fa-plus mr-2"></i>
              Add Project
            </button>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-folder-open text-6xl mb-4" style={{ color: 'var(--text-tertiary)' }}></i>
                <p style={{ color: 'var(--text-secondary)' }}>
                  No projects yet. Add your first project to get started.
                </p>
              </div>
            ) : (
              projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProject ? 'Edit Project' : 'Add Project'}
      >
        <ProjectForm
          project={editingProject}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
