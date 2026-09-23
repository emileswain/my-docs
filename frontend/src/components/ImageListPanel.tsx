import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useImageViewerStore } from '../store/useImageViewerStore';
import { imageUrl } from '../services/fileService';

/**
 * ImageListPanel - Right-hand panel showing a vertical list of the images in
 * the selected folder. Selecting one updates the shared store, which drives
 * the main view (ImageMainView).
 */
export function ImageListPanel() {
  const setImageViewerFolder = useAppStore((state) => state.setImageViewerFolder);

  const images = useImageViewerStore((state) => state.images);
  const index = useImageViewerStore((state) => state.index);
  const setIndex = useImageViewerStore((state) => state.setIndex);

  const listRef = useRef<HTMLDivElement>(null);

  // Keep the active row in view as the selection changes (e.g. via arrows).
  useEffect(() => {
    const row = listRef.current?.children[index] as HTMLElement | undefined;
    row?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [index]);

  return (
    <div
      className="panel flex flex-col"
      style={{
        minWidth: '200px',
        width: '260px',
        backgroundColor: 'var(--surface-panel)',
        borderLeft: '1px solid var(--border-primary)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 flex-shrink-0"
        style={{
          height: '60px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-tertiary)',
        }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-wide flex items-center gap-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          Images
          <span className="normal-case font-normal" style={{ color: 'var(--text-tertiary)' }}>
            {images.length}
          </span>
        </h2>
        <button
          onClick={() => setImageViewerFolder(null)}
          className="p-1"
          style={{ color: 'var(--text-secondary)' }}
          title="Close image viewer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-2">
        {images.length === 0 ? (
          <p className="italic text-sm p-2" style={{ color: 'var(--text-tertiary)' }}>
            No images
          </p>
        ) : (
          images.map((img, i) => {
            const isActive = i === index;
            return (
              <div
                key={img.path}
                className="flex items-center gap-2 p-1.5 rounded cursor-pointer mb-1"
                style={{
                  backgroundColor: isActive ? 'var(--accent-secondary)' : 'transparent',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--surface-panel-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => setIndex(i)}
              >
                <div
                  className="flex-shrink-0 rounded overflow-hidden"
                  style={{ width: '44px', height: '44px', backgroundColor: 'var(--bg-secondary)' }}
                >
                  <img
                    src={imageUrl(img.path)}
                    alt={img.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span
                  className="text-xs flex-1 truncate"
                  style={{
                    color: 'var(--text-primary)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                  title={img.name}
                >
                  {img.name}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
