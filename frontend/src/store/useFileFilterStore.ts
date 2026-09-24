import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

/**
 * useFileFilterStore - which file types are shown in the file tree.
 *
 * Groups come from the Rust backend (the definitive list). We track a set of
 * DISABLED extensions (so anything new defaults to visible) plus user-added
 * custom types, both persisted to localStorage.
 */
export interface FileTypeGroup {
  label: string;
  types: string[];
}

const DISABLED_KEY = 'fileFilter_disabled';
const CUSTOM_KEY = 'fileFilter_custom';

function load(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** Normalise to a leading-dot, lowercase extension (".md"). */
export function normaliseExt(input: string): string {
  const t = input.trim().toLowerCase();
  if (!t) return '';
  return t.startsWith('.') ? t : `.${t}`;
}

interface FileFilterState {
  groups: FileTypeGroup[];
  disabled: string[];
  custom: string[];
  loaded: boolean;
  loadGroups: () => Promise<void>;
  isDisabled: (ext: string) => boolean;
  toggleType: (ext: string) => void;
  setGroup: (types: string[], enabled: boolean) => void;
  addCustom: (ext: string) => void;
  removeCustom: (ext: string) => void;
  resetAll: () => void;
}

export const useFileFilterStore = create<FileFilterState>((set, get) => ({
  groups: [],
  disabled: load(DISABLED_KEY),
  custom: load(CUSTOM_KEY),
  loaded: false,

  loadGroups: async () => {
    if (get().loaded) return;
    try {
      const groups = await invoke<FileTypeGroup[]>('get_file_type_groups');
      set({ groups, loaded: true });
    } catch (err) {
      console.error('Failed to load file type groups:', err);
    }
  },

  isDisabled: (ext) => get().disabled.includes(ext),

  toggleType: (ext) => {
    const disabled = get().disabled;
    const next = disabled.includes(ext)
      ? disabled.filter((e) => e !== ext)
      : [...disabled, ext];
    save(DISABLED_KEY, next);
    set({ disabled: next });
  },

  // Enable or disable a whole group of types at once.
  setGroup: (types, enabled) => {
    const set0 = new Set(get().disabled);
    for (const t of types) {
      if (enabled) set0.delete(t);
      else set0.add(t);
    }
    const next = Array.from(set0);
    save(DISABLED_KEY, next);
    set({ disabled: next });
  },

  addCustom: (ext) => {
    const e = normaliseExt(ext);
    if (!e) return;
    const custom = get().custom;
    if (custom.includes(e)) return;
    const next = [...custom, e];
    save(CUSTOM_KEY, next);
    set({ custom: next });
  },

  removeCustom: (ext) => {
    const next = get().custom.filter((e) => e !== ext);
    save(CUSTOM_KEY, next);
    // Also drop any disabled entry for it so it doesn't linger.
    const disabled = get().disabled.filter((e) => e !== ext);
    save(DISABLED_KEY, disabled);
    set({ custom: next, disabled });
  },

  resetAll: () => {
    save(DISABLED_KEY, []);
    set({ disabled: [] });
  },
}));
