import { ReactNode } from 'react';

/**
 * Modal - Generic reusable modal/dialog component
 *
 * Purpose:
 * - Provides a reusable modal UI pattern with backdrop
 * - Handles click-outside to close behavior
 * - Fully customizable header, content, and footer
 *
 * Used by:
 * - ProjectForm component (add/edit project modal)
 *
 * Props:
 * - isOpen: Whether the modal is visible
 * - onClose: Callback when modal should be closed
 * - title: Modal title (optional)
 * - children: Content to render inside the modal
 * - size: Modal width size - 'sm', 'md', 'lg', 'xl' (default: 'md')
 *
 * Special considerations:
 * - Clicking backdrop closes the modal
 * - Clicking modal content does NOT close it (stopPropagation)
 * - Fixed positioning with z-50 to appear above all content
 * - Semi-transparent black backdrop (rgba(0, 0, 0, 0.5))
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl'
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`rounded-lg shadow-xl w-full ${sizeClasses[size]} mx-4`}
        style={{ backgroundColor: 'var(--surface-panel)' }}
      >
        {title && (
          <div
            className="flex items-center justify-between p-6"
            style={{ borderBottom: '1px solid var(--border-primary)' }}
          >
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{ color: 'var(--text-tertiary)' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
