import { useEffect, useCallback } from 'react';
import type { ImageItem } from '../../types';
import { imageUrl } from '../../services/fileService';

/**
 * ImageLightbox - Fullscreen overlay for viewing a folder's images.
 *
 * Supports cycling through the images with on-screen arrows and the
 * keyboard (Left/Right to navigate, Esc to close).
 */
interface ImageLightboxProps {
  images: ImageItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function ImageLightbox({ images, index, onIndexChange, onClose }: ImageLightboxProps) {
  const count = images.length;
  const current = images[index];

  const goPrev = useCallback(() => {
    if (count === 0) return;
    onIndexChange((index - 1 + count) % count);
  }, [count, index, onIndexChange]);

  const goNext = useCallback(() => {
    if (count === 0) return;
    onIndexChange((index + 1) % count);
  }, [count, index, onIndexChange]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext, onClose]);

  if (!current) return null;

  const arrowStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)',
    fontSize: '1.5rem',
    cursor: 'pointer',
    borderRadius: '9999px',
    width: '3rem',
    height: '3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-primary)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: '1rem 2rem',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
          {current.name}
          <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, marginLeft: '0.75rem' }}>
            {index + 1} / {count}
          </span>
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
          }}
        >
          ✕
        </button>
      </div>

      {/* Image area with side arrows */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <button style={arrowStyle} onClick={goPrev} title="Previous (←)" disabled={count < 2}>
          <i className="fas fa-chevron-left" />
        </button>
        <img
          src={imageUrl(current.path)}
          alt={current.name}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
        <button style={arrowStyle} onClick={goNext} title="Next (→)" disabled={count < 2}>
          <i className="fas fa-chevron-right" />
        </button>
      </div>
    </div>
  );
}
