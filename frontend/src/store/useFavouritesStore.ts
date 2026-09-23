import { create } from 'zustand';
import { settingsService } from '../services/settingsService';

/**
 * useFavouritesStore - Backend-synced set of favourited file paths.
 *
 * Mirrors the watch mechanism's persistence (settings.json) but for an
 * explicit list of absolute file paths. Acts as the single source of truth
 * so the file tree star toggles and the Favourites panel stay in sync.
 */
interface FavouritesState {
  favourites: string[];
  loaded: boolean;
  loadFavourites: () => Promise<void>;
  isFavourite: (path: string) => boolean;
  toggleFavourite: (path: string) => Promise<void>;
}

export const useFavouritesStore = create<FavouritesState>((set, get) => ({
  favourites: [],
  loaded: false,

  loadFavourites: async () => {
    try {
      const favourites = await settingsService.getFavourites();
      set({ favourites, loaded: true });
    } catch (err) {
      console.error('Failed to load favourites:', err);
    }
  },

  isFavourite: (path) => get().favourites.includes(path),

  toggleFavourite: async (path) => {
    const wasFavourite = get().favourites.includes(path);

    // Optimistic update
    set((state) => ({
      favourites: wasFavourite
        ? state.favourites.filter((p) => p !== path)
        : [...state.favourites, path],
    }));

    try {
      const favourites = wasFavourite
        ? await settingsService.removeFavourite(path)
        : await settingsService.addFavourite(path);
      set({ favourites });
    } catch (err) {
      console.error('Failed to toggle favourite:', err);
      // Revert on failure
      set((state) => ({
        favourites: wasFavourite
          ? [...state.favourites, path]
          : state.favourites.filter((p) => p !== path),
      }));
    }
  },
}));
