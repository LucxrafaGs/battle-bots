import { useEffect, useRef, useState } from 'react';
import './Cursor.css';

/* ==========================================================================
   Cursor personalizado (somente ponteiro fino).
   • Ponto preciso + anel com atraso.
   • Sobre links e botões o anel cresce.
   • Elementos com data-cursor="Texto" mostram um rótulo no anel.
   • Elementos com data-cursor-hide escondem o anel (ex.: viewport 3D).
   ========================================================================== */

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (hover: hover)');
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (!enabled) {
      html.classList.remove('has-cursor');
      return;
    }
    html.classList.add('has-cursor');
    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let scale = 1;
    let targetScale = 1;
    let visible = false;
    let raf = 0;
    let last = performance.now();

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        rx = x;
        ry = y;
        dot.current?.classList.add('is-visible');
        ring.current?.classList.add('is-visible');
      }
      const t = e.target as Element | null;
      const labelled = t?.closest?.('[data-cursor]') as HTMLElement | null;
      const hidden = t?.closest?.('[data-cursor-hide]');
      const interactive = t?.closest?.('a, button, [role="button"], label, select, [data-cursor-grow]');
      const text = labelled?.dataset.cursor ?? '';
      setLabel((prev) => (prev === text ? prev : text));
      targetScale = hidden ? 0.45 : text ? 3.2 : interactive ? 1.9 : 1;
      ring.current?.classList.toggle('is-label', !!text);
      ring.current?.classList.toggle('is-hidden', !!hidden && !text);
    };
    const leave = () => {
      visible = false;
      dot.current?.classList.remove('is-visible');
      ring.current?.classList.remove('is-visible');
    };
    const down = () => ring.current?.classList.add('is-down');
    const up = () => ring.current?.classList.remove('is-down');

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = 1 - Math.exp(-18 * dt);
      rx += (x - rx) * k;
      ry += (y - ry) * k;
      scale += (targetScale - scale) * (1 - Math.exp(-14 * dt));
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      html.classList.remove('has-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span className="cursor-label">{label}</span>
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
