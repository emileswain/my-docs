import { useState } from 'react';
import type { Project } from '../../types';
import type { CreateProjectDto, UpdateProjectDto } from '../../services/projectService';

/**
 * ProjectForm - Form component for creating or editing projects
 *
 * Purpose:
 * - Provides a reusable form for project data entry
 * - Handles both create and edit modes
 * - Validates required fields before submission
 *
 * Used by:
 * - Admin component (in modal for add/edit operations)
 *
 * Props:
 * - project: Project being edited (null for create mode)
 * - onSubmit: Callback when form is submitted with valid data
 * - onCancel: Callback when cancel button is clicked
 *
 * Special considerations:
 * - Title and path are required fields
 * - Description is optional
 * - Form data is controlled internally
 * - Emits CreateProjectDto or UpdateProjectDto on submit
 */
interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: CreateProjectDto | UpdateProjectDto) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    path: project?.path || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.path) {
      alert('Title and path are required');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Title
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, path: e.target.value })}
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
          onClick={onCancel}
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
          {project ? 'Save Changes' : 'Add Project'}
        </button>
      </div>
    </form>
  );
}
