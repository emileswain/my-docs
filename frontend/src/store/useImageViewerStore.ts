import { create } from 'zustand';
import { fileService } from '../services/fileService';
import type { ImageItem } from '../types';

/**
 * useImageViewerStore - Shared state for the folder image viewer.
 *
 * The viewer spans two sibling areas (the main view shows the selected image,
 * the side panel lists the folder's images), so the image list and selected
 * index live here rather than inside either component.
 */
interface ImageViewerState {
  images: ImageItem[];
  index: number;
  loading: boolean;
  error: string | null;
  loadFolder: (folderPath: string) => Promise<void>;
  setIndex: (index: number) => void;
  step: (delta: number) => void;
  reset: () => void;
}

export const useImageViewerStore = create<ImageViewerState>((set, get) => ({
  images: [],
  index: 0,
  loading: false,
  error: null,

  loadFolder: async (folderPath) => {
    set({ loading: true, error: null, index: 0, images: [] });
    try {
      const result = await fileService.listFolderImages(folderPath);
      set({ images: result.images, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load images',
        loading: false,
      });
    }
  },

  setIndex: (index) => set({ index }),

  step: (delta) => {
    const { images, index } = get();
    if (images.length === 0) return;
    const next = (((index + delta) % images.length) + images.length) % images.length;
    set({ index: next });
  },

  reset: () => set({ images: [], index: 0, loading: false, error: null }),
}));
