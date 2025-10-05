import { useState, useEffect, ReactNode } from 'react';

/**
 * Dropdown - Generic reusable dropdown component
 *
 * Purpose:
 * - Provides a reusable dropdown UI pattern
 * - Handles open/close state and click-outside detection
 * - Fully customizable trigger and content
 *
 * Used by:
 * - ProjectSelector component (project selection dropdown)
 *
 * Props:
 * - trigger: ReactNode to render as the dropdown trigger button
 * - children: ReactNode to render inside the dropdown panel
 * - isOpen: Controlled open state (optional)
 * - onToggle: Callback when dropdown is toggled (optional)
 * - className: Additional classes for the dropdown panel
 *
 * Special considerations:
 * - Handles click-outside to close dropdown automatically
 * - Prevents event propagation on trigger and panel clicks
 * - Can be used in controlled or uncontrolled mode
 */
interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
}

export function Dropdown({ trigger, children, isOpen, onToggle, className = '' }: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : internalOpen;

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !open;

    if (isControlled) {
      onToggle?.(newState);
    } else {
      setInternalOpen(newState);
    }
  };

  const close = () => {
    if (isControlled) {
      onToggle?.(false);
    } else {
      setInternalOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener('click', close);
      return () => {
        document.removeEventListener('click', close);
      };
    }
  }, [open]);

  return (
    <div className="relative">
      <div onClick={toggle}>
        {trigger}
      </div>

      {open && (
        <div
          className={`absolute z-10 mt-1 shadow-lg rounded ${className}`}
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-primary)',
            border: '1px solid'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}
