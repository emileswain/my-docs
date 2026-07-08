import { useState } from 'react';
import type { SubProject, SubprojectType } from '../../types';
import { SUBPROJECT_TYPE_ICONS } from '../../types';
import type { CreateSubProjectDto, UpdateSubProjectDto } from '../../services/projectService';

interface SubProjectFormProps {
  subProject?: SubProject | null;
  onSubmit: (data: CreateSubProjectDto | UpdateSubProjectDto) => void;
  onCancel: () => void;
}

const TYPE_OPTIONS: { value: SubprojectType; label: string }[] = [
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'firmware', label: 'Firmware' },
  { value: 'services', label: 'Services / API' },
  { value: 'docs', label: 'Documentation' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'database', label: 'Database' },
  { value: 'cloud', label: 'Cloud / Infra' },
  { value: 'testing', label: 'Testing' },
  { value: 'design', label: 'Design' },
  { value: 'workspace', label: 'Workspace' },
];

export function SubProjectForm({ subProject, onSubmit, onCancel }: SubProjectFormProps) {
  const [formData, setFormData] = useState({
    title: subProject?.title || '',
    description: subProject?.description || '',
    path: subProject?.path || '',
    type: (subProject?.type || 'web') as SubprojectType,
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
            borderColor: 'var(--border-focus)',
          }}
          placeholder="e.g., Device, Mobile App"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Type
        </label>
        <div className="grid grid-cols-4 gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData({ ...formData, type: opt.value })}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors"
              style={{
                border: formData.type === opt.value
                  ? '2px solid var(--accent-primary)'
                  : '1px solid var(--border-primary)',
                backgroundColor: formData.type === opt.value
                  ? 'var(--accent-secondary)'
                  : 'var(--bg-secondary)',
                color: formData.type === opt.value
                  ? 'var(--accent-primary)'
                  : 'var(--text-primary)',
              }}
            >
              <i className={`fas ${SUBPROJECT_TYPE_ICONS[opt.value]} text-xs`}></i>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Description
        </label>
        <textarea
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2"
          style={{
            border: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-focus)',
          }}
          placeholder="Optional description..."
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
            borderColor: 'var(--border-focus)',
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
            backgroundColor: 'var(--bg-tertiary)',
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
            borderColor: 'var(--border-focus)',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
        >
          {subProject ? 'Save Changes' : 'Add Sub-project'}
        </button>
      </div>
    </form>
  );
}
