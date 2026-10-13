import { useEffect } from 'react';
import Lenis from 'lenis';
import { reducedMotion } from '@/lib/motion';

/* Rolagem suave global (Lenis). Desativada com movimento reduzido.
   Áreas com rolagem própria usam o atributo data-lenis-prevent. */

let lenis: Lenis | null = null;

export const getLenis = () => lenis;

export function scrollToTop(smooth = false) {
  if (lenis) lenis.scrollTo(0, { immediate: !smooth, force: true });
  else window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
}

export default function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
    let id = 0;
    const raf = (t: number) => {
      lenis?.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
  return null;
}
