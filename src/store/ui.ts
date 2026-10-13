import { create } from 'zustand';

interface UiState {
  /** O carregamento inicial terminou e a Home foi revelada. */
  booted: boolean;
  /** Uma transição de página cobre a tela neste momento. */
  covered: boolean;
  /** Incrementa sempre que uma página é revelada (dispara as entradas). */
  revealTick: number;
  menuOpen: boolean;
  setBooted: () => void;
  setCovered: (v: boolean) => void;
  reveal: () => void;
  setMenuOpen: (v: boolean) => void;
}

export const useUi = create<UiState>((set) => ({
  booted: false,
  covered: false,
  revealTick: 0,
  menuOpen: false,
  setBooted: () => set({ booted: true }),
  setCovered: (covered) => set({ covered }),
  reveal: () => set((s) => ({ revealTick: s.revealTick + 1, covered: false })),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}));
