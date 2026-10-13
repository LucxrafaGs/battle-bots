import { useEffect, useRef } from 'react';
import { reducedMotion } from '@/lib/motion';

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789-';

/* Troca de texto com embaralhamento curto (para identificadores). */
export default function ScrambleText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(text);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prev.current === text || reducedMotion()) {
      el.textContent = text;
      prev.current = text;
      return;
    }
    prev.current = text;
    const start = performance.now();
    const len = text.length;
    const total = 520;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / total);
      const fixed = Math.floor(p * len);
      let out = '';
      for (let i = 0; i < len; i++) {
        out += i < fixed || text[i] === '-' ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return (
    <span ref={ref} className={className} aria-live="off">
      {text}
    </span>
  );
}
