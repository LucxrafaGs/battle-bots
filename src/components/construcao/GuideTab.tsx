import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConstrucaoParams } from '@/hooks/useConstrucaoParams';
import { animate, stagger } from 'animejs';
import { GUIDE_STEPS } from '@/data/guides';
import { reducedMotion } from '@/lib/motion';
import EmptySlot from '@/components/ui/EmptySlot';
import MediaView from '@/components/ui/MediaView';

const pad = (n: number) => String(n).padStart(2, '0');
const HINT = 'Preencher em src/data/guides/index.ts';

/* Guia de montagem passo a passo. As etapas vêm de src/data/guides. */
export default function GuideTab() {
  const [, item] = useConstrucaoParams();
  const navigate = useNavigate();
  const index = Math.max(0, GUIDE_STEPS.findIndex((s) => s.id === item));
  const step = GUIDE_STEPS[index];
  const body = useRef<HTMLDivElement>(null);
  const dir = useRef(1);
  const prevIndex = useRef(index);

  const goTo = (i: number) => {
    if (i < 0 || i >= GUIDE_STEPS.length) return;
    dir.current = i > index ? 1 : -1;
    navigate(`/construcao/montagem/${GUIDE_STEPS[i].id}`, { replace: true });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, [role="tablist"], .monaco-editor')) return;
      if (e.key === 'ArrowRight') goTo(index + 1);
      if (e.key === 'ArrowLeft') goTo(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (prevIndex.current === index) return;
    prevIndex.current = index;
    const el = body.current;
    if (!el || reducedMotion()) return;
    animate(el.querySelectorAll('.gd-anim'), {
      translateX: [dir.current * 40, 0],
      opacity: [0, 1],
      duration: 800,
      delay: stagger(50),
      ease: 'outExpo',
    });
    animate(el.querySelectorAll('.gd-num-inner'), {
      translateY: [dir.current > 0 ? '100%' : '-100%', '0%'],
      duration: 900,
      ease: 'outExpo',
    });
  }, [index]);

  if (!step) return <EmptySlot label="Nenhuma etapa cadastrada" hint={HINT} />;
  const hasBody = !!step.body?.length;
  const hasMedia = !!step.media?.length;

  return (
    <div className="gd page-pad">
      <ol className="gd-steps" aria-label="Etapas">
        {GUIDE_STEPS.map((s, i) => {
          const filled = !!(s.body?.length || s.media?.length);
          return (
            <li key={s.id}>
              <button
                className={`gd-step ${i === index ? 'is-active' : ''} ${i < index ? 'is-past' : ''}`}
                aria-current={i === index ? 'step' : undefined}
                onClick={() => goTo(i)}
              >
                <span className="gd-step-num">{pad(i + 1)}</span>
                <span className="gd-step-title">{s.title}</span>
                <span className="gd-step-state">{filled ? 'Com conteúdo' : 'A preencher'}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <article className="gd-body" ref={body} aria-live="polite">
        <div className="gd-progress" aria-hidden="true">
          {GUIDE_STEPS.map((s, i) => (
            <i key={s.id} className={i <= index ? 'is-on' : ''} />
          ))}
        </div>

        <header className="gd-head">
          <span className="gd-num display" aria-hidden="true">
            <span className="gd-num-inner">{pad(index + 1)}</span>
          </span>
          <div>
            <p className="gd-of muted gd-anim">
              Etapa {index + 1} de {GUIDE_STEPS.length}
            </p>
            <h2 className="gd-title gd-anim">{step.title}</h2>
          </div>
        </header>

        <div className="gd-content">
          {hasBody ? (
            <div className="gd-text gd-anim">
              {step.body!.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            <EmptySlot className="gd-anim" label="Instruções" hint={HINT} />
          )}

          {hasMedia ? (
            <div className="gd-media">
              {step.media!.map((m, i) => (
                <figure key={i} className="gd-anim">
                  <MediaView item={m} />
                  {m.caption && <figcaption>{m.caption}</figcaption>}
                </figure>
              ))}
            </div>
          ) : (
            <div className="gd-media gd-media--empty">
              <EmptySlot className="gd-anim" label="Fotos" hint="Imagens da etapa" ratio="4/3" />
              <EmptySlot className="gd-anim" label="Animação ou vídeo" hint="Arquivo de vídeo ou YouTube" ratio="4/3" />
              <EmptySlot className="gd-anim" label="Modelo 3D" hint="GLB ou STL da etapa" ratio="4/3" />
            </div>
          )}

          {!!step.notes?.length && (
            <ul className="gd-notes gd-anim">
              {step.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
        </div>

        <nav className="gd-nav" aria-label="Navegação entre etapas">
          <button className="gd-nav-btn" onClick={() => goTo(index - 1)} disabled={index === 0}>
            <span className="muted">Anterior</span>
            <span>{GUIDE_STEPS[index - 1]?.title ?? ''}</span>
          </button>
          <button
            className="gd-nav-btn gd-nav-btn--next"
            onClick={() => goTo(index + 1)}
            disabled={index === GUIDE_STEPS.length - 1}
          >
            <span className="muted">Próxima</span>
            <span>{GUIDE_STEPS[index + 1]?.title ?? ''}</span>
          </button>
        </nav>
      </article>
    </div>
  );
}
