import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConstrucaoParams } from '@/hooks/useConstrucaoParams';
import { animate, stagger } from 'animejs';
import DiagramTab from '@/components/construcao/DiagramTab';
import { reducedMotion } from '@/lib/motion';
import { useIntro } from '@/hooks/useIntro';
import './Construcao.css';

const CodeTab = lazy(() => import('@/components/construcao/CodeTab'));

const TABS = [
  { id: 'eletrica', label: 'Elétrica' },
  { id: 'codigos', label: 'Códigos' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Construcao() {
  const [tabParam] = useConstrucaoParams();
  const navigate = useNavigate();
  const tab: TabId = (TABS.find((t) => t.id === tabParam)?.id ?? 'eletrica') as TabId;
  const tabsRef = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // Indicador deslizante sob a aba ativa
  useLayoutEffect(() => {
    const place = () => {
      const el = tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${tab}"]`);
      const b = bar.current;
      if (!el || !b) return;
      b.style.transform = `translateX(${el.offsetLeft}px)`;
      b.style.width = `${el.offsetWidth}px`;
    };
    place();
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener('resize', place);
  }, [tab]);

  // Troca de conteúdo com máscara
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!panel.current || reducedMotion()) return;
    animate(panel.current, {
      clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
      translateY: [30, 0],
      duration: 900,
      ease: 'inOutQuart',
    });
  }, [tab]);

  useIntro(() => {
    if (reducedMotion()) return;
    const els = [tabsRef.current, panel.current].filter(Boolean) as HTMLElement[];
    animate(els, { opacity: [0, 1], translateY: [24, 0], duration: 1100, delay: stagger(120, { start: 380 }), ease: 'outExpo' });
  });

  const setTab = (id: TabId) => navigate(`/construcao/${id}`, { replace: false });

  const onKey = (e: React.KeyboardEvent) => {
    const idx = TABS.findIndex((t) => t.id === tab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = TABS[(idx + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
      setTab(next.id);
      tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${next.id}"]`)?.focus();
    }
  };

  return (
    <div className={`page cst ${tab === 'eletrica' ? 'is-fixed' : ''}`}>
      <div className="cst-head page-pad">
      <h1 className="cst-title">Construção</h1>
      <div className="cst-tabs" role="tablist" aria-label="Seções de construção" ref={tabsRef} onKeyDown={onKey}>
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            data-tab={t.id}
            id={`cst-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="cst-panel"
            tabIndex={tab === t.id ? 0 : -1}
            className={`cst-tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
        <span className="cst-tabs-bar" ref={bar} aria-hidden="true" />
      </div>
      </div>

      <div id="cst-panel" role="tabpanel" aria-labelledby={`cst-tab-${tab}`} className="cst-panel" ref={panel}>
        {tab === 'eletrica' && <DiagramTab />}
        {tab === 'codigos' && (
          <Suspense fallback={<div className="cst-loading page-pad muted">Carregando editor…</div>}>
            <CodeTab />
          </Suspense>
        )}
      </div>
    </div>
  );
}
