import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DIAGRAMS, DIAGRAM_VIEW_LABEL } from '@/data/diagrams';
import { asset } from '@/lib/motion';
import { useConstrucaoParams } from '@/hooks/useConstrucaoParams';
import EmptySlot from '@/components/ui/EmptySlot';
import PanZoom, { type PanZoomHandle } from '@/components/ui/PanZoom';

const HINT = 'Cadastrar em src/data/diagrams/index.ts e public/diagramas/';

type Focus = { kind: 'net'; id: string } | { kind: 'part'; id: string; nets: string[] } | null;

/* Biblioteca de diagramas elétricos — somente consulta.
   Nas vistas SVG, passar o mouse (ou tocar) em um fio destaca a ligação
   inteira; em uma peça, destaca tudo o que chega nela. */
export default function DiagramTab() {
  const [, item] = useConstrucaoParams();
  const navigate = useNavigate();
  const diagram = DIAGRAMS.find((d) => d.id === item) ?? DIAGRAMS[0];
  const [viewIdx, setViewIdx] = useState(0);
  const [scale, setScale] = useState(1);
  const [hover, setHover] = useState<Focus>(null);
  const [pinned, setPinned] = useState<Focus>(null);
  const pz = useRef<PanZoomHandle>(null);
  const stage = useRef<HTMLDivElement>(null);
  const focus = hover ?? pinned;

  useEffect(() => {
    setViewIdx(0);
    setPinned(null);
    setHover(null);
  }, [diagram?.id]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof DIAGRAMS>();
    DIAGRAMS.forEach((d) => map.set(d.group, [...(map.get(d.group) ?? []), d]));
    return Array.from(map.entries());
  }, []);

  const view = diagram?.views[viewIdx];
  const isPdf = view?.format === 'pdf';
  const isSvg = view?.format === 'svg';

  // Aplica o destaque no SVG embutido
  useEffect(() => {
    const root = stage.current?.querySelector('.pz-svg');
    if (!root) return;
    root.querySelectorAll('.is-hl').forEach((el) => el.classList.remove('is-hl'));
    if (!focus) {
      root.classList.remove('has-hl');
      return;
    }
    const nets = focus.kind === 'net' ? [focus.id] : focus.nets;
    let hit = 0;
    nets.forEach((n) =>
      root.querySelectorAll(`[data-net="${CSS.escape(n)}"]`).forEach((el) => {
        el.classList.add('is-hl');
        hit++;
      }),
    );
    root.querySelectorAll<SVGElement>('[data-part]').forEach((el) => {
      const own = (el.dataset.nets ?? '').split(' ');
      if ((focus.kind === 'part' && el.dataset.part === focus.id) || nets.some((n) => own.includes(n))) {
        el.classList.add('is-hl');
        hit++;
      }
    });
    root.classList.toggle('has-hl', hit > 0);
  });

  if (!diagram) {
    return (
      <div className="dg page-pad">
        <EmptySlot label="Nenhum diagrama cadastrado" hint={HINT} ratio="16/7" />
      </div>
    );
  }

  const url = view ? asset(view.file) : '';
  const netInfo = (id: string) => diagram.nets?.find((n) => n.id === id);

  const fromEvent = (target: EventTarget | null): Focus => {
    const el = target instanceof Element ? target : null;
    const net = el?.closest<SVGElement>('[data-net]');
    if (net?.dataset.net && netInfo(net.dataset.net)) return { kind: 'net', id: net.dataset.net };
    const p = el?.closest<SVGElement>('[data-part]');
    if (p?.dataset.part) return { kind: 'part', id: p.dataset.part, nets: (p.dataset.nets ?? '').split(' ').filter(Boolean) };
    return null;
  };

  const fullscreen = () => {
    const el = stage.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.().catch(() => undefined);
  };

  const hud = focus?.kind === 'net' ? netInfo(focus.id) : null;
  const partName =
    focus?.kind === 'part'
      ? (stage.current?.querySelector(`[data-part="${CSS.escape(focus.id)}"]`)?.getAttribute('aria-label') ?? null)
      : null;

  return (
    <div className="dg page-pad">
      <aside className="dg-list" aria-label="Diagramas" data-lenis-prevent>
        {groups.map(([group, list]) => (
          <div key={group} className="dg-group">
            <p className="dg-group-name">{group}</p>
            <ul>
              {list.map((d) => (
                <li key={d.id}>
                  <button
                    className={`dg-item ${d.id === diagram.id ? 'is-active' : ''}`}
                    aria-current={d.id === diagram.id}
                    onClick={() => navigate(`/construcao/eletrica/${d.id}`, { replace: true })}
                  >
                    <span>{d.name}</span>
                    <span className="dg-item-meta muted">
                      {d.views.length} {d.views.length === 1 ? 'vista' : 'vistas'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      <section className="dg-main">
        <div className="dg-toolbar">
          <div className="dg-views" role="group" aria-label="Vistas do circuito">
            {diagram.views.map((v, i) => (
              <button
                key={i}
                className={`dg-view ${i === viewIdx ? 'is-active' : ''}`}
                aria-pressed={i === viewIdx}
                onClick={() => setViewIdx(i)}
              >
                {v.label ?? DIAGRAM_VIEW_LABEL[v.kind]}
              </button>
            ))}
          </div>
          <div className="dg-tools">
            {!isPdf && (
              <>
                <button className="dg-tool" onClick={() => pz.current?.zoomOut()} aria-label="Reduzir">
                  −
                </button>
                <span className="dg-scale" aria-live="polite">
                  {Math.round(scale * 100)}%
                </span>
                <button className="dg-tool" onClick={() => pz.current?.zoomIn()} aria-label="Ampliar">
                  +
                </button>
                <button className="dg-tool dg-tool--text" onClick={() => pz.current?.fit()}>
                  Ajustar
                </button>
                <button className="dg-tool dg-tool--text" onClick={() => pz.current?.actual()}>
                  100%
                </button>
              </>
            )}
            <button className="dg-tool dg-tool--text" onClick={fullscreen}>
              Tela cheia
            </button>
            <a className="dg-tool dg-tool--text" href={url} target="_blank" rel="noreferrer">
              Abrir arquivo
            </a>
          </div>
        </div>

        <div
          className="dg-stage"
          ref={stage}
          data-lenis-prevent
          onPointerOver={(e) => isSvg && setHover(fromEvent(e.target))}
          onPointerLeave={() => setHover(null)}
          onClick={(e) => {
            if (!isSvg) return;
            const f = fromEvent(e.target);
            setPinned((cur) => (f && cur && JSON.stringify(cur) === JSON.stringify(f) ? null : f));
          }}
        >
          {!view ? (
            <EmptySlot label="Nenhuma vista cadastrada para este diagrama" hint={HINT} />
          ) : isPdf ? (
            <iframe className="dg-pdf" src={url} title={`${diagram.name} — PDF`} />
          ) : (
            <PanZoom
              key={url}
              ref={pz}
              src={url}
              inline={isSvg}
              alt={`${diagram.name} — ${view.label ?? DIAGRAM_VIEW_LABEL[view.kind]}`}
              onScale={setScale}
            />
          )}
          {diagram.example && <span className="tag dg-example">Exemplo</span>}
          {(hud || partName) && (
            <div className="dg-hud" role="status">
              {hud ? (
                <>
                  <span className="dg-hud-name">
                    <i style={{ background: hud.color }} />
                    {hud.label}
                  </span>
                  {hud.detail && <span className="dg-hud-detail">{hud.detail}</span>}
                </>
              ) : (
                <span className="dg-hud-name">{partName}</span>
              )}
            </div>
          )}
        </div>
        {!isPdf && (
          <p className="dg-help muted">
            {isSvg
              ? 'Passe o mouse ou toque em um fio para destacar a ligação; clique para fixar. Role para ampliar e arraste para mover.'
              : 'Role para ampliar, arraste para mover, duplo clique para aproximar.'}
          </p>
        )}
      </section>

      <aside className="dg-info" aria-label="Informações técnicas" data-lenis-prevent>
        <h3 className="dg-info-title">{diagram.name}</h3>
        {diagram.description ? (
          <p className="dg-desc">{diagram.description}</p>
        ) : (
          <EmptySlot compact label="Descrição" hint={HINT} />
        )}

        {diagram.nets?.length ? (
          <div className="dg-block">
            <p className="dg-block-title">Ligações</p>
            <ul className="dg-nets">
              {diagram.nets.map((n) => {
                const on = focus?.kind === 'net' && focus.id === n.id;
                return (
                  <li key={n.id}>
                    <button
                      className={`dg-net ${on ? 'is-on' : ''}`}
                      aria-pressed={pinned?.kind === 'net' && pinned.id === n.id}
                      onPointerEnter={() => setHover({ kind: 'net', id: n.id })}
                      onPointerLeave={() => setHover(null)}
                      onFocus={() => setHover({ kind: 'net', id: n.id })}
                      onBlur={() => setHover(null)}
                      onClick={() =>
                        setPinned((cur) => (cur?.kind === 'net' && cur.id === n.id ? null : { kind: 'net', id: n.id }))
                      }
                    >
                      <i style={{ background: n.color }} />
                      <span>{n.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {diagram.notes?.length ? (
          <div className="dg-block">
            <p className="dg-block-title">Atenção e dicas</p>
            <ul className="dg-notes">
              {diagram.notes.map((n, i) => (
                <li key={i} className={`dg-note dg-note--${n.level}`}>
                  <span className="dg-note-tag">{n.level === 'atencao' ? 'Atenção' : 'Dica'}</span>
                  {n.text}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="dg-block">
          <p className="dg-block-title">Informações técnicas</p>
          {diagram.info && Object.keys(diagram.info).length ? (
            <dl className="dg-specs">
              {Object.entries(diagram.info).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <EmptySlot compact label="Sem informações cadastradas" />
          )}
        </div>

        {diagram.bom?.length ? (
          <div className="dg-block">
            <p className="dg-block-title">Lista de material</p>
            <ul className="dg-bom">
              {diagram.bom.map((b) => (
                <li key={b.item}>
                  <span className="dg-bom-qty">{b.qty}</span>
                  <span>
                    {b.item}
                    {b.note && <span className="dg-bom-note"> · {b.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="dg-block">
          <p className="dg-block-title">Arquivos</p>
          {diagram.downloads?.length ? (
            <ul className="dl-list">
              {diagram.downloads.map((d) => (
                <li key={d.file}>
                  <a className="dl-link" href={asset(d.file)} download>
                    <span>{d.label}</span>
                    <span className="dl-ext">{d.file.split('.').pop()?.toUpperCase()}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <EmptySlot compact label="Nenhum arquivo para download" />
          )}
        </div>
      </aside>
    </div>
  );
}
