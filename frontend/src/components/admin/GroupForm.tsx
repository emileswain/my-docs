import { useState } from 'react';
import type { ProjectGroup } from '../../types';
import type { CreateGroupDto } from '../../services/projectService';

interface GroupFormProps {
  group?: ProjectGroup | null;
  onSubmit: (data: CreateGroupDto) => void;
  onCancel: () => void;
}

export function GroupForm({ group, onSubmit, onCancel }: GroupFormProps) {
  const [title, setTitle] = useState(group?.title || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    onSubmit({ title: title.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Group Title
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2"
          style={{
            border: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-focus)',
          }}
          placeholder="e.g., Work, Personal, Open Source"
        />
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
          {group ? 'Save Changes' : 'Add Group'}
        </button>
      </div>
    </form>
  );
}
