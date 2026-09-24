import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

/**
 * useFileFilterStore - which file types the tree surfaces.
 *
 * Tracks an ENABLED set of extensions (the tree's backend browse only returns
 * files whose extension is enabled). Defaults to the original document types;
 * other types are opt-in. Groups come from the Rust backend; the user can add
 * custom types. Enabled set + custom types persist to localStorage.
 */
export interface FileTypeGroup {
  label: string;
  types: string[];
}

/** The types shown by default (the tree's original behaviour). */
export const DEFAULT_ENABLED = ['.md', '.json', '.yml', '.yaml', '.mmd', '.xml'];

const ENABLED_KEY = 'fileFilter_enabled';
const CUSTOM_KEY = 'fileFilter_custom';

function load(key: string, fallback: string[]): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
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
  enabled: string[];
  custom: string[];
  loaded: boolean;
  loadGroups: () => Promise<void>;
  isEnabled: (ext: string) => boolean;
  isCustomised: () => boolean;
  toggleType: (ext: string) => void;
  setGroup: (types: string[], enabled: boolean) => void;
  addCustom: (ext: string) => void;
  removeCustom: (ext: string) => void;
  resetDefault: () => void;
}

export const useFileFilterStore = create<FileFilterState>((set, get) => ({
  groups: [],
  enabled: load(ENABLED_KEY, DEFAULT_ENABLED),
  custom: load(CUSTOM_KEY, []),
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

  isEnabled: (ext) => get().enabled.includes(ext),

  isCustomised: () => {
    const e = [...get().enabled].sort();
    const d = [...DEFAULT_ENABLED].sort();
    return e.length !== d.length || e.some((x, i) => x !== d[i]);
  },

  toggleType: (ext) => {
    const enabled = get().enabled;
    const next = enabled.includes(ext)
      ? enabled.filter((e) => e !== ext)
      : [...enabled, ext];
    save(ENABLED_KEY, next);
    set({ enabled: next });
  },

  setGroup: (types, enabled) => {
    const set0 = new Set(get().enabled);
    for (const t of types) {
      if (enabled) set0.add(t);
      else set0.delete(t);
    }
    const next = Array.from(set0);
    save(ENABLED_KEY, next);
    set({ enabled: next });
  },

  addCustom: (ext) => {
    const e = normaliseExt(ext);
    if (!e) return;
    const custom = get().custom;
    const nextCustom = custom.includes(e) ? custom : [...custom, e];
    // Adding a custom type enables it by default.
    const enabled = get().enabled.includes(e) ? get().enabled : [...get().enabled, e];
    save(CUSTOM_KEY, nextCustom);
    save(ENABLED_KEY, enabled);
    set({ custom: nextCustom, enabled });
  },

  removeCustom: (ext) => {
    const nextCustom = get().custom.filter((e) => e !== ext);
    const enabled = get().enabled.filter((e) => e !== ext);
    save(CUSTOM_KEY, nextCustom);
    save(ENABLED_KEY, enabled);
    set({ custom: nextCustom, enabled });
  },

  resetDefault: () => {
    save(ENABLED_KEY, DEFAULT_ENABLED);
    set({ enabled: [...DEFAULT_ENABLED] });
  },
}));
