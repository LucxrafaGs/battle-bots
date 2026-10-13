import { animate, createTimeline, stagger, utils } from 'animejs';

export { animate, createTimeline, stagger, utils };

export const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/** Duração que respeita movimento reduzido. */
export const dur = (ms: number) => (reducedMotion() ? 1 : ms);

export const EASE = {
  out: 'outExpo',
  outSoft: 'out(4)',
  inOut: 'inOutQuart',
  snap: 'inOutExpo',
} as const;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Suavização exponencial independente de frame-rate. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Curvas para uso direto (0..1 → 0..1). */
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeInCubic = (t: number) => t * t * t;
export const easeOutBack = (t: number, s = 1.2) => {
  const c3 = s + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
};

/** Prévia online (artifact): o servidor não entrega .glb/.stl. */
export const PREVIEW = import.meta.env.VITE_PREVIEW === '1';

/** URL de um arquivo em public/ respeitando o base do Vite. */
export const asset = (path: string) =>
  /^(https?:|data:|blob:)/.test(path) ? path : `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
