import { useEffect, useRef, useState } from 'react';
import { createTimeline, stagger } from 'animejs';
import { runBoot } from '@/lib/boot';
import { reducedMotion } from '@/lib/motion';
import { useUi } from '@/store/ui';
import './Loader.css';

/* ==========================================================================
   Tela de carregamento.
   O contador acompanha o carregamento REAL dos recursos essenciais
   (src/lib/boot.ts). O símbolo se monta peça a peça conforme o progresso
   e as letras de BATTLE BOTS aparecem em etapas. Ao final, as duas chapas
   se afastam como as laterais do robô e revelam a Home.
   ========================================================================== */

const WORD = 'BATTLE BOTS';
const LETTERS = Array.from(WORD);
const LETTER_COUNT = LETTERS.filter((c) => c !== ' ').length;

/** Limiar de progresso em que cada peça do símbolo encaixa. */
const PIECES = [
  { key: 'fc', at: 0.05 },
  { key: 'l1', at: 0.35 },
  { key: 'l2', at: 0.65 },
  { key: 'tp', at: 0.92 },
] as const;

export default function Loader() {
  const setBooted = useUi((s) => s.setBooted);
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const status = useRef<HTMLSpanElement>(null);
  const real = useRef(0);
  const finished = useRef(false);

  useEffect(() => {
    const el = root.current!;
    const reduce = reducedMotion();
    let shown = 0;
    let raf = 0;
    let last = performance.now();
    let outro = false;
    const letters = Array.from(el.querySelectorAll<HTMLElement>('.ld-letter'));
    const pieces = PIECES.map((p) => el.querySelector<HTMLElement>(`.ld-piece--${p.key}`)!);

    runBoot((p, label) => {
      real.current = p;
      if (status.current && label) status.current.textContent = `${label} carregado`;
    }).then(() => {
      finished.current = true;
    });

    const update = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const target = real.current;
      // O valor exibido persegue o real e nunca o ultrapassa.
      const speed = finished.current ? 3.2 : 1.6;
      shown = Math.min(target, shown + Math.max((target - shown) * (1 - Math.exp(-6 * dt)), speed * 0.25 * dt));
      if (reduce) shown = target;

      if (counter.current) counter.current.textContent = String(Math.round(shown * 100)).padStart(3, '0');
      let li = 0;
      letters.forEach((l) => {
        if (l.dataset.space) return;
        li++;
        l.classList.toggle('is-on', shown >= li / (LETTER_COUNT + 1));
      });
      PIECES.forEach((p, i) => pieces[i].classList.toggle('is-on', shown >= p.at));
      el.style.setProperty('--ld-p', shown.toFixed(4));

      if (finished.current && shown >= 0.999 && !outro) {
        outro = true;
        runOutro();
        return;
      }
      raf = requestAnimationFrame(update);
    };

    const runOutro = () => {
      if (reduce) {
        setBooted();
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }).onfinish = () =>
          setGone(true);
        return;
      }
      const tl = createTimeline({ defaults: { ease: 'inOutQuart' } });
      tl.add('.ld-line', { scaleX: [1, 0], duration: 600, ease: 'inQuart' }, 0)
        .add('.ld-meta-inner', { translateY: ['0%', '110%'], duration: 520, ease: 'inQuart' }, 0)
        .add(
          '.ld-letter',
          {
            fontStretch: ['62%', '125%'],
            duration: 620,
            delay: stagger(18),
            ease: 'inOutCubic',
          },
          0,
        )
        .add('.ld-letter', { translateY: ['0%', '-110%'], duration: 560, delay: stagger(20), ease: 'inQuart' }, 520)
        .add('.ld-piece--l1', { translateX: [0, '-40vw'], opacity: [1, 0], duration: 1000 }, 700)
        .add('.ld-piece--l2', { translateX: [0, '40vw'], opacity: [1, 0], duration: 1000 }, 700)
        .add('.ld-piece--fc, .ld-piece--tp', { scale: [1, 0.6], opacity: [1, 0], duration: 500 }, 700)
        .add('.ld-plate--l', { translateX: ['0%', '-101%'], duration: 1100 }, 820)
        .add('.ld-plate--r', { translateX: ['0%', '101%'], duration: 1100 }, 820)
        .call(() => setBooted(), 900);
      tl.then(() => setGone(true));
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [setBooted]);

  if (gone) return null;

  return (
    <div ref={root} className="ld" role="status" aria-live="polite" aria-label="Carregando Battle Bots">
      <div className="ld-plate ld-plate--l" />
      <div className="ld-plate ld-plate--r" />

      <div className="ld-mark" aria-hidden="true">
        <i className="ld-piece ld-piece--l1" />
        <i className="ld-piece ld-piece--fc" />
        <i className="ld-piece ld-piece--l2" />
        <i className="ld-piece ld-piece--tp" />
      </div>
      <div className="ld-line" aria-hidden="true" />

      <div className="ld-word display" aria-hidden="true">
        {LETTERS.map((c, i) =>
          c === ' ' ? (
            <span key={i} className="ld-letter ld-space" data-space="1">
              &nbsp;
            </span>
          ) : (
            <span key={i} className="ld-letter-mask">
              <span className="ld-letter">{c}</span>
            </span>
          ),
        )}
      </div>

      <div className="ld-meta">
        <span className="ld-meta-mask">
          <span className="ld-meta-inner ld-status" ref={status}>
            Carregando recursos
          </span>
        </span>
        <span className="ld-meta-mask">
          <span className="ld-meta-inner ld-counter">
            <span ref={counter}>000</span>
          </span>
        </span>
      </div>
    </div>
  );
}
