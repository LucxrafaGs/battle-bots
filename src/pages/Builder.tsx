import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import type { ModuleCategory } from '@/types/content';
import { getModule, modulesOf } from '@/data/frames/catalog';
import { compatIssues } from '@/data/frames/compat';
import { CATEGORY_LABEL, CATEGORY_ORDER, EXPORT_FILENAME, EXPORT_FOLDER, STANDARD_ID } from '@/data/frames/standard';
import { useBuilder, type CameraView } from '@/store/builder';
import { useIntro } from '@/hooks/useIntro';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { PREVIEW, reducedMotion } from '@/lib/motion';
import {
  buildZip,
  checkAll,
  downloadBlob,
  parseConfig,
  type StlCheck,
} from '@/lib/exportStl';
import BuilderScene from '@/three/BuilderScene';
import ModuleCard from '@/components/builder/ModuleCard';
import Modal from '@/components/ui/Modal';
import SwapWord from '@/components/ui/SwapWord';
import './Builder.css';

const VIEW_LABEL: Record<CameraView, string> = {
  padrao: 'Padrão',
  superior: 'Superior',
  frontal: 'Frontal',
  lateral: 'Lateral',
};

/* ------------------------------------------------------------------ toast */

function useToast() {
  const [msg, setMsg] = useState<{ text: string; id: number } | null>(null);
  const timer = useRef(0);
  const show = useCallback((text: string) => {
    window.clearTimeout(timer.current);
    setMsg({ text, id: Date.now() });
    timer.current = window.setTimeout(() => setMsg(null), 3200);
  }, []);
  return { msg, show };
}

/* ------------------------------------------------------------- exportação */

function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const combination = useBuilder((s) => s.combination);
  const [checks, setChecks] = useState<StlCheck[] | null>(null);
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setChecks(null);
    setState('idle');
    setError('');
    checkAll(combination).then((c) => alive && setChecks(c));
    return () => {
      alive = false;
    };
  }, [open, combination]);

  const missing = checks?.filter((c) => c.status !== 'ok') ?? [];
  const ready = checks !== null && missing.length === 0;

  const run = async () => {
    setState('working');
    setError('');
    try {
      const { blob, filename } = await buildZip(combination);
      downloadBlob(blob, filename);
      setState('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao gerar o ZIP.');
      setState('error');
    }
  };

  const statusText = (c: StlCheck) =>
    ({
      checking: 'Verificando',
      ok: 'STL disponível',
      missing: 'STL ausente',
      placeholder: 'Provisória, sem STL',
      'not-registered': 'STL não cadastrado',
    })[c.status];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Exportar STL"
      wide
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>
            Fechar
          </button>
          <button className="btn btn--primary" disabled={PREVIEW || !ready || state === 'working'} onClick={run}>
            {state === 'working' ? 'Preparando ZIP…' : state === 'done' ? 'Baixar novamente' : 'Baixar ZIP'}
          </button>
        </>
      }
    >
      <p className="exp-lead md-stagger muted">
        Pacote com os quatro arquivos STL originais da combinação, mais <code>configuracao.json</code> e{' '}
        <code>LEIA-ME.md</code>.
      </p>
      <ul className="exp-list">
        {CATEGORY_ORDER.map((cat) => {
          const c = checks?.find((x) => x.category === cat);
          const m = getModule(combination[cat]);
          const status = c?.status ?? 'checking';
          return (
            <li key={cat} className={`exp-row md-stagger is-${status}`}>
              <span className="exp-cat">{CATEGORY_LABEL[cat]}</span>
              <span className="exp-name">
                {m?.name ?? combination[cat]}
                <span className="exp-id">{combination[cat]}</span>
              </span>
              <span className="exp-file">
                {EXPORT_FILENAME[cat]}
                {(m?.extraStl ?? []).map((e) => (
                  <span key={e.file} className="exp-extra">
                    + {EXPORT_FOLDER[cat]}/{e.filename}
                  </span>
                ))}
              </span>
              <span className="exp-status">
                <i aria-hidden="true" />
                {c ? statusText(c) : 'Verificando'}
              </span>
            </li>
          );
        })}
        <li className="exp-row exp-row--extra md-stagger is-ok">
          <span className="exp-cat">Configuração</span>
          <span className="exp-name">Combinação para recuperar no montador</span>
          <span className="exp-file">configuracao.json</span>
          <span className="exp-status">
            <i aria-hidden="true" />
            Gerado
          </span>
        </li>
      </ul>

      {compatIssues(CATEGORY_ORDER.map((c) => combination[c])).map((n) => (
        <div key={n.a + n.b} className="exp-warn md-stagger" role="note">
          <strong>
            {n.a} + {n.b}:
          </strong>{' '}
          {n.reason}
        </div>
      ))}
      {PREVIEW && (
        <div className="exp-warn md-stagger" role="note">
          Esta é a prévia online: o visualizador bloqueia downloads. Os STL estão no projeto em{' '}
          <code>public/stl/</code> — rode o site localmente para baixar o ZIP.
        </div>
      )}
      {checks && missing.length > 0 && (
        <div className="exp-alert md-stagger" role="alert">
          <strong>Exportação bloqueada.</strong> Faltam {missing.length} de 4 arquivos STL:{' '}
          {missing.map((m) => CATEGORY_LABEL[m.category]).join(', ')}. Cadastre os STLs em{' '}
          <code>public/stl/</code> e no catálogo <code>src/data/frames/catalog.ts</code> para liberar o download.
        </div>
      )}
      {state === 'error' && (
        <div className="exp-alert" role="alert">
          {error}
        </div>
      )}
      {state === 'done' && (
        <p className="exp-ok" role="status">
          Download iniciado.
        </p>
      )}
    </Modal>
  );
}

/* ---------------------------------------------------- salvar / carregar */

function SaveModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: (n: string) => void }) {
  const combination = useBuilder((s) => s.combination);
  const saveCurrent = useBuilder((s) => s.saveCurrent);
  const [name, setName] = useState('');
  useEffect(() => {
    if (open) setName(CATEGORY_ORDER.map((c) => combination[c]).join(' / '));
  }, [open, combination]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = saveCurrent(name);
    onSaved(entry.name);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Salvar combinação">
      <form id="save-form" onSubmit={submit} className="save-form">
        <label className="field md-stagger">
          <span className="field-label">Nome da combinação</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
        </label>
        <p className="muted md-stagger save-note">Fica guardada neste navegador. Não é preciso criar conta.</p>
        <div className="save-actions md-stagger">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary">
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function LoadModal({
  open,
  onClose,
  notify,
}: {
  open: boolean;
  onClose: () => void;
  notify: (t: string) => void;
}) {
  const saved = useBuilder((s) => s.saved);
  const loadSaved = useBuilder((s) => s.loadSaved);
  const removeSaved = useBuilder((s) => s.removeSaved);
  const apply = useBuilder((s) => s.applyCombination);
  const file = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const combo = parseConfig(await f.text());
      apply(combo, f.name.replace(/\.json$/i, ''));
      notify('Combinação importada.');
      onClose();
    } catch (err) {
      notify(err instanceof Error ? `Arquivo inválido: ${err.message}` : 'Arquivo inválido.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Carregar combinação" variant="side">
      <div className="load-import md-stagger">
        <button className="btn btn--ghost" onClick={() => file.current?.click()}>
          Importar configuracao.json
        </button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={onFile} />
      </div>
      {saved.length === 0 ? (
        <p className="load-empty muted md-stagger">
          Nenhuma combinação salva neste navegador. Use “Salvar” no montador para guardar a atual.
        </p>
      ) : (
        <ul className="load-list">
          {saved.map((s) => (
            <li key={s.id} className="load-item md-stagger">
              <button
                className="load-main"
                onClick={() => {
                  loadSaved(s.id);
                  notify(`“${s.name}” carregada.`);
                  onClose();
                }}
              >
                <span className="load-name">{s.name}</span>
                <span className="load-ids">
                  {CATEGORY_ORDER.map((c) => (
                    <span key={c}>{s.modules[c]}</span>
                  ))}
                </span>
                <span className="load-date muted">
                  {new Date(s.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </button>
              <button
                className="load-del"
                aria-label={`Excluir ${s.name}`}
                onClick={() => {
                  removeSaved(s.id);
                  notify('Combinação excluída.');
                }}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

/* ----------------------------------------------------------------- página */

const CAT_SHORT: Record<ModuleCategory, string> = {
  lateral1: 'Lateral 1',
  lateral2: 'Lateral 2',
  frame: 'Frame',
  tampa: 'Tampa',
};

/** Ícones de linha de cada categoria (vista simplificada da peça). */
function CategoryIcon({ cat }: { cat: ModuleCategory }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
    'aria-hidden': true,
    className: 'bld-cat-icon',
  };
  if (cat === 'lateral1' || cat === 'lateral2') {
    return (
      <svg {...common} style={cat === 'lateral2' ? { transform: 'scaleX(-1)' } : undefined}>
        <path d="M3 8.5 7 5h10.5L21 8.5V17H3z" />
        <circle cx="8" cy="14" r="2.6" />
        <path d="M13 11h5M13 14h5" />
        <text x="21" y="22.5" fontSize="5.5" fill="currentColor" stroke="none" textAnchor="end"
          style={cat === 'lateral2' ? { transform: 'scaleX(-1)', transformOrigin: '18px 21px' } : undefined}>
          {cat === 'lateral1' ? '1' : '2'}
        </text>
      </svg>
    );
  }
  if (cat === 'frame') {
    return (
      <svg {...common}>
        <path d="M5 3h14v18h-4.5v-4.5h-5V21H5z" />
        <path d="M5 8h14M5 13h14" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 11.5 6 8h12l3 3.5V15H3z" />
      <path d="M7 15v3M17 15v3M9 11.5h6" />
    </svg>
  );
}

export default function Builder() {
  const combination = useBuilder((s) => s.combination);
  const currentName = useBuilder((s) => s.currentName);
  const active = useBuilder((s) => s.activeCategory);
  const hover = useBuilder((s) => s.hoverCategory);
  const exploded = useBuilder((s) => s.exploded);
  const view = useBuilder((s) => s.view);
  const select = useBuilder((s) => s.select);
  const setActive = useBuilder((s) => s.setActiveCategory);
  const setHover = useBuilder((s) => s.setHoverCategory);
  const toggleExploded = useBuilder((s) => s.toggleExploded);
  const playAssembly = useBuilder((s) => s.playAssembly);
  const setView = useBuilder((s) => s.setView);
  const newAssembly = useBuilder((s) => s.newAssembly);
  const restoreDefault = useBuilder((s) => s.restoreDefault);

  const isMobile = useMediaQuery('(max-width: 900px)');
  const [collapsed, setCollapsed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modal, setModal] = useState<'export' | 'save' | 'load' | null>(null);
  const toast = useToast();
  const root = useRef<HTMLDivElement>(null);
  const cards = useRef<HTMLDivElement>(null);
  const list = modulesOf(active);
  const issues = compatIssues(CATEGORY_ORDER.map((c) => combination[c]));

  useIntro(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    animate(el.querySelectorAll('.bld-in'), {
      translateY: [26, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: stagger(55, { start: 200 }),
      ease: 'outExpo',
    });
  });

  // Cartões entram quando a categoria muda
  useEffect(() => {
    const el = cards.current;
    if (!el || reducedMotion()) return;
    animate(el.querySelectorAll('.mcard'), {
      translateY: [18, 0],
      opacity: [0, 1],
      duration: 700,
      delay: stagger(45),
      ease: 'outExpo',
    });
  }, [active]);

  const pickCategory = (c: ModuleCategory) => {
    setActive(c);
    if (isMobile) setSheetOpen(true);
  };

  const onLoadError = useCallback(
    (id: string) => toast.show(`Não foi possível carregar o modelo 3D de ${id}.`),
    [toast.show],
  );

  const selected = getModule(combination[active]);

  const panelBody = (
    <>
      <div className="bld-cats" role="tablist" aria-label="Categorias de módulos">
        {CATEGORY_ORDER.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              role="tab"
              id={`tab-${cat}`}
              aria-selected={isActive}
              aria-controls="bld-variacoes"
              aria-label={`${CATEGORY_LABEL[cat]} — ${combination[cat]}`}
              title={`${CATEGORY_LABEL[cat]} · ${combination[cat]}`}
              className={`bld-cat ${isActive ? 'is-active' : ''} ${hover === cat ? 'is-hover' : ''}`}
              onClick={() => pickCategory(cat)}
              onPointerEnter={() => setHover(cat)}
              onPointerLeave={() => setHover(null)}
            >
              <CategoryIcon cat={cat} />
              <span className="bld-cat-name">{CAT_SHORT[cat]}</span>
            </button>
          );
        })}
      </div>

      <div
        id="bld-variacoes"
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        className="bld-vars"
        data-lenis-prevent
      >
        <p className="bld-vars-head">
          <span>
            {CATEGORY_LABEL[active]} <span className="bld-vars-id">{combination[active]}</span>
          </span>
          <span className="muted">{list.length} variações</span>
        </p>
        {list.length === 0 ? (
          <p className="muted bld-vars-empty">Nenhuma peça cadastrada nesta categoria.</p>
        ) : (
          <div className="bld-cards" ref={cards}>
            {list.map((m) => (
              <ModuleCard
                key={m.id}
                module={m}
                selected={combination[active] === m.id}
                onSelect={() => {
                  select(active, m.id);
                }}
              />
            ))}
          </div>
        )}
        {selected?.specs && Object.keys(selected.specs).length > 0 && (
          <dl className="bld-specs">
            <dt className="bld-specs-title">{selected.name}</dt>
            {Object.entries(selected.specs).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="bld-actions">
        <button className="btn btn--ghost btn--sm" onClick={() => newAssembly()}>
          Nova montagem
        </button>
        <button className="btn btn--ghost btn--sm" onClick={() => setModal('save')}>
          Salvar combinação
        </button>
        <button className="btn btn--ghost btn--sm" onClick={() => setModal('load')}>
          Carregar combinação
        </button>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => {
            restoreDefault();
            toast.show('Montagem padrão restaurada.');
          }}
        >
          Restaurar padrão
        </button>
      </div>
    </>
  );

  return (
    <div
      ref={root}
      className={`bld ${collapsed ? 'is-collapsed' : ''} ${sheetOpen ? 'is-sheet-open' : ''}`}
    >
      <section className="bld-stage" aria-label="Visualização 3D do robô">
        <SwapWord className="bld-word display" text={CATEGORY_LABEL[hover ?? active]} />

        <div className="bld-canvas" data-cursor-hide>
          <BuilderScene onLoadError={onLoadError} />
        </div>

        <div className="bld-hud bld-hud--tl bld-in">
          <p className="bld-name">{currentName ?? 'Montagem não salva'}</p>
          <p className="bld-std muted">Padrão modular {STANDARD_ID}</p>
          {issues.length > 0 && (
            <div className="bld-warn" role="status">
              {issues.map((n) => (
                <p key={n.a + n.b}>
                  <strong>
                    {n.a} + {n.b}
                  </strong>
                  {n.reason}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="bld-hud bld-hud--tr bld-in" role="group" aria-label="Vistas da câmera">
          {(Object.keys(VIEW_LABEL) as CameraView[]).map((v) => (
            <button
              key={v}
              className={`bld-view ${view.name === v && view.tick > 0 ? 'is-active' : ''}`}
              onClick={() => setView(v)}
            >
              {VIEW_LABEL[v]}
            </button>
          ))}
        </div>

        <div className="bld-hud bld-hud--bl bld-in">
          <button className="btn btn--ghost" onClick={playAssembly}>
            Ver montagem
          </button>
          <button
            className={`btn btn--ghost ${exploded ? 'is-active' : ''}`}
            aria-pressed={exploded}
            onClick={toggleExploded}
          >
            Vista explodida
          </button>
        </div>

        <div className="bld-hud bld-hud--br bld-in">
          <button className="btn btn--primary bld-export" onClick={() => setModal('export')}>
            Exportar STL
          </button>
        </div>

        {!isMobile && (
          <button
            className="bld-collapse bld-in"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            aria-controls="bld-panel"
          >
            {collapsed ? 'Abrir painel' : 'Recolher painel'}
          </button>
        )}
      </section>

      <aside id="bld-panel" className="bld-panel" aria-label="Seleção de módulos">
        {isMobile && (
          <button
            className="bld-sheet-handle"
            onClick={() => setSheetOpen((o) => !o)}
            aria-expanded={sheetOpen}
          >
            <span aria-hidden="true" className="bld-grip" />
            {sheetOpen ? 'Recolher módulos' : 'Escolher módulos'}
          </button>
        )}
        <div className="bld-panel-inner">{panelBody}</div>
      </aside>

      <ExportModal open={modal === 'export'} onClose={() => setModal(null)} />
      <SaveModal
        open={modal === 'save'}
        onClose={() => setModal(null)}
        onSaved={(n) => toast.show(`“${n}” salva neste navegador.`)}
      />
      <LoadModal open={modal === 'load'} onClose={() => setModal(null)} notify={toast.show} />

      <div className="toast" role="status" aria-live="polite">
        {toast.msg && (
          <span key={toast.msg.id} className="toast-msg">
            {toast.msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
