import { useState, useEffect } from 'react';
import type { Project } from '../types';
import { useProjects } from '../hooks/useProjects';

export function Admin() {
  const { projects, loadProjects, createProject, updateProject, deleteProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    path: '',
  });

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.path) {
      alert('Title and path are required');
      return;
    }

    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
      } else {
        await createProject(formData);
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
    setFormData({ title: '', description: '', path: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      path: project.path,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({ title: '', description: '', path: '' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Navigation */}
      <nav className="shadow-sm h-16 flex items-center justify-between px-6" style={{ backgroundColor: 'var(--surface-panel)' }}>
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>File Viewer Admin</h1>
        </div>
        <a
          href="/"
          className="px-4 py-2 text-sm rounded-md"
          style={{ color: 'var(--text-primary)' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-panel-hover)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Viewer
        </a>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar Navigation */}
        <div className="w-64 min-h-[calc(100vh-4rem)]" style={{ backgroundColor: 'var(--surface-panel)', borderRight: '1px solid var(--border-primary)' }}>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 rounded-md"
                  style={{ color: 'var(--accent-primary)', backgroundColor: 'var(--accent-secondary)' }}
                >
                  <i className="fas fa-folder mr-3"></i>
                  Projects
                </a>
              </li>
            </ul>
          </nav>
        </div>

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
                <div
                  key={project.id}
                  className="rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  style={{
                    backgroundColor: 'var(--surface-panel)',
                    border: '1px solid var(--border-primary)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {project.title}
                        </h3>
                        <span className="px-2 py-1 text-xs rounded" style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)'
                        }}>
                          {project.slug}
                        </span>
                      </div>
                      {project.description && (
                        <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center">
                          <i className="fas fa-folder mr-2" style={{ color: 'var(--text-tertiary)' }}></i>
                          <code className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--code-bg)' }}>
                            {project.path}
                          </code>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <a
                        href={`/?project=${project.slug}`}
                        className="p-2 rounded-md transition-colors"
                        style={{ color: 'var(--accent-primary)' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="View Project"
                      >
                        <i className="fas fa-eye"></i>
                      </a>
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-2 rounded-md transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-panel-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Edit Project"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                        className="p-2 rounded-md transition-colors"
                        style={{ color: 'var(--color-red-600)' }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-red-50)';
                        }}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Delete Project"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Project Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="rounded-lg shadow-xl w-full max-w-2xl mx-4" style={{ backgroundColor: 'var(--surface-panel)' }}>
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editingProject ? 'Edit Project' : 'Add Project'}
              </h3>
              <button
                onClick={closeModal}
                style={{ color: 'var(--text-tertiary)' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-focus)'
                    }}
                    placeholder="My Project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-focus)'
                    }}
                    placeholder="Project description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Path
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.path}
                    onChange={(e) =>
                      setFormData({ ...formData, path: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-focus)'
                    }}
                    placeholder="/path/to/project"
                  />
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Absolute path to the project directory
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-md"
                    style={{
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-tertiary)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'white',
                      borderColor: 'var(--border-focus)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
                  >
                    {editingProject ? 'Save Changes' : 'Add Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
