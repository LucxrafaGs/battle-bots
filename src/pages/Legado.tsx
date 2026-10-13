import { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { EDITIONS, LEGACY_SUMMARY } from '@/data/legacy';
import { asset, reducedMotion } from '@/lib/motion';
import { editionSummary } from '@/lib/legacy';
import { useIntro } from '@/hooks/useIntro';
import KineticTitle from '@/components/ui/KineticTitle';
import { TLink } from '@/components/layout/PageTransition';
import './Legado.css';

/* ==========================================================================
   LEGADO — índice por ano.
   Anos em tipografia enorme. Ao passar o cursor, o ano se expande e uma
   janela de mídia acompanha o ponteiro (capa cadastrada ou estado vazio).
   ========================================================================== */

export default function Legado() {
  const list = useRef<HTMLUListElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredEdition = EDITIONS.find((e) => e.year === hovered);

  useIntro(() => {
    const rows = list.current?.querySelectorAll('.lg-row-inner');
    if (!rows) return;
    if (reducedMotion()) {
      rows.forEach((r) => ((r as HTMLElement).style.transform = 'none'));
      return;
    }
    animate(rows, {
      translateY: ['105%', '0%'],
      duration: 1300,
      delay: stagger(80, { start: 300 }),
      ease: 'outExpo',
    });
    animate(list.current!.querySelectorAll('.lg-rule'), {
      scaleX: [0, 1],
      duration: 1400,
      delay: stagger(80, { start: 200 }),
      ease: 'inOutQuart',
    });
  });

  // Janela de mídia que segue o cursor
  useEffect(() => {
    const el = preview.current;
    if (!el || !window.matchMedia('(hover: hover)').matches) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const loop = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      const tilt = Math.max(-8, Math.min(8, (x - cx) * 0.05));
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${tilt}deg)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
    };
  }, []);

  return (
    <div className="page lg">
      <header className="phead page-pad lg-head">
        <KineticTitle className="phead-title" lines={[{ text: 'Legado' }]} radius={220} stretch={[92, 125]} weight={[760, 900]} />
        <p className="phead-sub">Arquivo das edições Battle Bots: as fotos, os vídeos e a história de cada ano.</p>
      </header>

      <ul className="lg-list" ref={list} onPointerLeave={() => setHovered(null)}>
        {EDITIONS.map((e) => (
          <li key={e.year} className={`lg-item ${hovered === e.year ? 'is-hover' : ''} ${hovered && hovered !== e.year ? 'is-dim' : ''}`}>
            <span className="lg-rule" aria-hidden="true" />
            <TLink
              to={`/legado/${e.year}`}
              className="lg-row page-pad"
              onPointerEnter={() => setHovered(e.year)}
              onFocus={() => setHovered(e.year)}
              onBlur={() => setHovered(null)}
              data-cursor="Abrir"
            >
              <span className="lg-row-mask">
                <span className="lg-row-inner">
                  <span className="lg-year display">{e.year}</span>
                  <span className="lg-meta">
                    <span className="lg-name">{e.title ?? `Battle Bots ${e.year}`}</span>
                    <span className="lg-sum muted">{editionSummary(e)}</span>
                  </span>
                </span>
              </span>
            </TLink>
          </li>
        ))}
        <li aria-hidden="true">
          <span className="lg-rule" />
        </li>
      </ul>

      <section className="lg-summary page-pad">
        <p>{LEGACY_SUMMARY}</p>
      </section>

      <div ref={preview} className={`lg-preview ${hovered ? 'is-on' : ''}`} aria-hidden="true">
        <div className="lg-preview-inner">
          {hoveredEdition?.cover ? (
            <img key={hoveredEdition.cover} src={asset(hoveredEdition.cover)} alt="" />
          ) : (
            <div className="lg-preview-empty">
              <span>{hovered}</span>
              <span>Sem mídia cadastrada</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
