import { useEffect, type RefObject } from 'react';
import { useUi } from '@/store/ui';

/* Revela elementos [data-reveal] ao entrarem na tela (classe .is-in). */
export function useReveal(root: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  const covered = useUi((s) => s.covered);
  const booted = useUi((s) => s.booted);
  useEffect(() => {
    const el = root.current;
    if (!el || !booted || covered) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'));
    if (!('IntersectionObserver' in window)) {
      items.forEach((i) => i.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted, covered, ...deps]);
}
