import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { Combination, ModuleCategory, SavedCombination } from '@/types/content';
import { DEFAULT_COMBINATION, sanitizeCombination } from '@/data/frames/catalog';

export type CameraView = 'padrao' | 'superior' | 'frontal' | 'lateral';

interface BuilderState {
  combination: Combination;
  /** Nome da combinação salva carregada (null = montagem não salva). */
  currentName: string | null;
  activeCategory: ModuleCategory;
  hoverCategory: ModuleCategory | null;
  exploded: boolean;
  assemblyTick: number;
  view: { name: CameraView; tick: number };
  saved: SavedCombination[];

  select: (category: ModuleCategory, id: string) => void;
  setActiveCategory: (c: ModuleCategory) => void;
  setHoverCategory: (c: ModuleCategory | null) => void;
  toggleExploded: () => void;
  playAssembly: () => void;
  setView: (name: CameraView) => void;
  newAssembly: () => void;
  restoreDefault: () => void;
  saveCurrent: (name: string) => SavedCombination;
  loadSaved: (id: string) => void;
  removeSaved: (id: string) => void;
  applyCombination: (c: Partial<Combination>, name?: string | null) => void;
}

/** localStorage protegido: nunca lança erro (modo privado, bloqueios etc.). */
const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* armazenamento indisponível */
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* armazenamento indisponível */
    }
  },
};

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const useBuilder = create<BuilderState>()(
  persist(
    (set, get) => ({
      combination: sanitizeCombination(DEFAULT_COMBINATION),
      currentName: null,
      activeCategory: 'frame',
      hoverCategory: null,
      exploded: false,
      assemblyTick: 0,
      view: { name: 'padrao', tick: 0 },
      saved: [],

      select: (category, id) =>
        set((s) =>
          s.combination[category] === id
            ? s
            : { combination: { ...s.combination, [category]: id }, currentName: null },
        ),
      setActiveCategory: (activeCategory) => set({ activeCategory }),
      setHoverCategory: (hoverCategory) => set({ hoverCategory }),
      toggleExploded: () => set((s) => ({ exploded: !s.exploded })),
      playAssembly: () => set((s) => ({ assemblyTick: s.assemblyTick + 1, exploded: false })),
      setView: (name) => set((s) => ({ view: { name, tick: s.view.tick + 1 } })),

      newAssembly: () =>
        set((s) => ({
          combination: sanitizeCombination(DEFAULT_COMBINATION),
          currentName: null,
          exploded: false,
          activeCategory: 'frame',
          view: { name: 'padrao', tick: s.view.tick + 1 },
          assemblyTick: s.assemblyTick + 1,
        })),
      restoreDefault: () =>
        set({ combination: sanitizeCombination(DEFAULT_COMBINATION), currentName: null }),

      saveCurrent: (name) => {
        const entry: SavedCombination = {
          id: uid(),
          name: name.trim() || 'Montagem sem nome',
          createdAt: new Date().toISOString(),
          modules: { ...get().combination },
        };
        set((s) => ({ saved: [entry, ...s.saved], currentName: entry.name }));
        return entry;
      },
      loadSaved: (id) => {
        const entry = get().saved.find((e) => e.id === id);
        if (entry) get().applyCombination(entry.modules, entry.name);
      },
      removeSaved: (id) => set((s) => ({ saved: s.saved.filter((e) => e.id !== id) })),
      applyCombination: (c, name = null) =>
        set({ combination: sanitizeCombination(c), currentName: name, exploded: false }),
    }),
    {
      name: 'battle-bots:montador',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ combination: s.combination, saved: s.saved, currentName: s.currentName }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<BuilderState>;
        return {
          ...current,
          combination: sanitizeCombination(p.combination),
          saved: Array.isArray(p.saved) ? p.saved : [],
          currentName: p.currentName ?? null,
        };
      },
    },
  ),
);
