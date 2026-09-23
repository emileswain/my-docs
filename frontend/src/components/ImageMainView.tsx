import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useImageViewerStore } from '../store/useImageViewerStore';
import { imageUrl } from '../services/fileService';
import { ImageLightbox } from './viewers/ImageLightbox';

/**
 * ImageMainView - Center view area that shows the image selected in the
 * folder image viewer. Provides a header (folder + image name), a large
 * preview that opens fullscreen on click, and prev/next cycling. The list of
 * thumbnails lives in the side panel (ImageListPanel); both read the shared
 * useImageViewerStore.
 */
export function ImageMainView() {
  const folder = useAppStore((state) => state.imageViewerFolder);
  const setImageViewerFolder = useAppStore((state) => state.setImageViewerFolder);

  const images = useImageViewerStore((state) => state.images);
  const index = useImageViewerStore((state) => state.index);
  const loading = useImageViewerStore((state) => state.loading);
  const error = useImageViewerStore((state) => state.error);
  const setIndex = useImageViewerStore((state) => state.setIndex);
  const step = useImageViewerStore((state) => state.step);

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const count = images.length;
  const current = images[index];

  // Arrow-key cycling while the viewer is focused (and lightbox is closed).
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxOpen) return;
      if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [step, lightboxOpen]);

  const closeButton = (
    <button
      onClick={() => setImageViewerFolder(null)}
      className="p-1 flex-shrink-0"
      style={{ color: 'var(--text-secondary)' }}
      title="Close image viewer"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  const edgeArrowStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'var(--surface-panel)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)',
    fontSize: '1.1rem',
    cursor: 'pointer',
    borderRadius: '9999px',
    width: '2.75rem',
    height: '2.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
  };

  return (
    <div
      className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center px-4 flex-shrink-0 gap-3"
        style={{
          height: '60px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-tertiary)',
        }}
      >
        {closeButton}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
          <i className="fas fa-images" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-sm font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
            {folder?.name}
          </span>
          {current && (
            <>
              <span style={{ color: 'var(--text-tertiary)' }}>/</span>
              <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {current.name}
              </span>
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                {index + 1}/{count}
              </span>
            </>
          )}
        </div>
        {closeButton}
      </div>

      {/* Image area */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-6 overflow-hidden">
        {loading ? (
          <p className="italic text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading images...</p>
        ) : error ? (
          <p className="italic text-sm" style={{ color: 'var(--text-tertiary)' }}>{error}</p>
        ) : count === 0 ? (
          <div className="text-center" style={{ color: 'var(--text-tertiary)' }}>
            <i className="fas fa-images text-6xl mb-4"></i>
            <p>No images in this folder</p>
          </div>
        ) : (
          <>
            {count > 1 && (
              <button style={{ ...edgeArrowStyle, left: '1rem' }} onClick={() => step(-1)} title="Previous (←)">
                <i className="fas fa-chevron-left" />
              </button>
            )}
            <img
              key={current.path}
              src={imageUrl(current.path)}
              alt={current.name}
              className="cursor-zoom-in"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }}
              onClick={() => setLightboxOpen(true)}
              title="Click to view fullscreen"
            />
            {count > 1 && (
              <button style={{ ...edgeArrowStyle, right: '1rem' }} onClick={() => step(1)} title="Next (→)">
                <i className="fas fa-chevron-right" />
              </button>
            )}
          </>
        )}
      </div>

      {lightboxOpen && count > 0 && (
        <ImageLightbox
          images={images}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
