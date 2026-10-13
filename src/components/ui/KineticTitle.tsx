import { useEffect, useRef, type CSSProperties } from 'react';
import { animate, stagger } from 'animejs';
import { useIntro } from '@/hooks/useIntro';
import { reducedMotion } from '@/lib/motion';

/* ==========================================================================
   Título tipográfico em grande escala.
   • Entrada: cada letra sobe de dentro de uma máscara.
   • Proximidade: as letras próximas ao cursor ganham largura e peso
     (eixos variáveis wdth/wght da Archivo), como peças sob pressão.
   ========================================================================== */

interface Line {
  text: string;
  className?: string;
  style?: CSSProperties;
}

interface Props {
  lines: Line[];
  as?: 'h1' | 'h2' | 'p';
  className?: string;
  /** Raio de influência do cursor, em px. 0 desativa. */
  radius?: number;
  /** Largura (font-stretch, %) em repouso e sob o cursor. */
  stretch?: [number, number];
  weight?: [number, number];
  delay?: number;
  label?: string;
}

export default function KineticTitle({
  lines,
  as: Tag = 'h1',
  className = '',
  radius = 260,
  stretch = [100, 125],
  weight = [800, 900],
  delay = 0,
  label,
}: Props) {
  const root = useRef<HTMLHeadingElement>(null);

  useIntro(() => {
    const el = root.current;
    if (!el) return;
    const letters = el.querySelectorAll('.kt-char');
    if (reducedMotion()) {
      letters.forEach((l) => ((l as HTMLElement).style.transform = 'none'));
      return;
    }
    animate(letters, {
      translateY: ['108%', '0%'],
      rotate: [6, 0],
      duration: 1400,
      delay: stagger(42, { start: delay }),
      ease: 'outExpo',
    });
  });

  useEffect(() => {
    const el = root.current;
    if (!el || radius <= 0 || reducedMotion()) return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    const chars = Array.from(el.querySelectorAll<HTMLElement>('.kt-char'));
    const state = chars.map(() => 0);
    let mx = -9999;
    let my = -9999;
    let raf = 0;
    let running = false;
    let last = performance.now();
    let centers: { x: number; y: number }[] = [];

    const measure = () => {
      centers = chars.map((c) => {
        const r = c.parentElement!.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let moving = false;
      chars.forEach((c, i) => {
        const p = centers[i];
        const d = p ? Math.hypot(mx - p.x, my - p.y) : Infinity;
        const target = Math.max(0, 1 - d / radius);
        const eased = target * target * (3 - 2 * target);
        state[i] += (eased - state[i]) * (1 - Math.exp(-9 * dt));
        if (Math.abs(eased - state[i]) > 0.002) moving = true;
        const v = state[i];
        c.style.fontStretch = `${(stretch[0] + (stretch[1] - stretch[0]) * v).toFixed(1)}%`;
        c.style.fontWeight = String(Math.round(weight[0] + (weight[1] - weight[0]) * v));
      });
      if (moving) raf = requestAnimationFrame(tick);
      else running = false;
    };
    const kick = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      measure();
      kick();
    };
    const onLeave = () => {
      mx = my = -9999;
      kick();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, stretch[0], stretch[1], weight[0], weight[1]]);

  const text = label ?? lines.map((l) => l.text).join(' ');
  return (
    <Tag ref={root} className={`kt ${className}`} aria-label={text}>
      {lines.map((line, li) => (
        <span key={li} className={`kt-line ${line.className ?? ''}`} style={line.style} aria-hidden="true">
          {Array.from(line.text).map((ch, ci) => (
            <span key={ci} className="kt-mask">
              <span
                className="kt-char"
                style={{ fontStretch: `${stretch[0]}%`, fontWeight: weight[0] }}
              >
                {ch === ' ' ? ' ' : ch}
              </span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
