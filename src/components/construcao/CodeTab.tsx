import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor, { type OnMount } from '@monaco-editor/react';
import '@/lib/monaco';
import { CODES } from '@/data/codes';
import { asset } from '@/lib/motion';
import { useConstrucaoParams } from '@/hooks/useConstrucaoParams';
import { downloadBlob } from '@/lib/exportStl';
import EmptySlot from '@/components/ui/EmptySlot';

const HINT = 'Cadastrar em src/data/codes/index.ts e public/codigos/';

type EditorInstance = Parameters<OnMount>[0];

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/* Biblioteca de códigos padronizados (somente leitura). */
export default function CodeTab() {
  const [, item] = useConstrucaoParams();
  const navigate = useNavigate();
  const entry = CODES.find((c) => c.id === item) ?? CODES[0];
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const editor = useRef<EditorInstance | null>(null);
  const decorations = useRef<{ clear: () => void } | null>(null);

  useEffect(() => {
    setSource(null);
    setError('');
    setActiveSection(null);
    if (!entry?.source) return;
    let alive = true;
    fetch(asset(entry.source), { cache: 'no-cache' })
      .then((r) => {
        if (!r.ok || (r.headers.get('content-type') ?? '').includes('text/html')) throw new Error();
        return r.text();
      })
      .then((t) => alive && setSource(t))
      .catch(() => alive && setError(`Arquivo não encontrado: ${entry.source}`));
    return () => {
      alive = false;
    };
  }, [entry]);

  if (!entry) {
    return (
      <div className="cd page-pad">
        <EmptySlot label="Nenhum código cadastrado" hint={HINT} ratio="16/7" />
      </div>
    );
  }

  const filename = entry.filename ?? entry.source?.split('/').pop() ?? `${entry.id}.ino`;

  const focusSection = (i: number) => {
    const s = entry.sections?.[i];
    const ed = editor.current;
    if (!s || !ed) return;
    setActiveSection(i);
    const [a, b] = s.lines;
    ed.revealLinesInCenter(a, b);
    decorations.current?.clear();
    decorations.current = ed.createDecorationsCollection([
      {
        range: { startLineNumber: a, startColumn: 1, endLineNumber: b, endColumn: 1 },
        options: { isWholeLine: true, className: 'cd-line-hl', linesDecorationsClassName: 'cd-line-mark' },
      },
    ]);
  };

  return (
    <div className="cd page-pad">
      <aside className="cd-list" aria-label="Códigos">
        <ul>
          {CODES.map((c) => (
            <li key={c.id}>
              <button
                className={`cd-item ${c.id === entry.id ? 'is-active' : ''}`}
                aria-current={c.id === entry.id}
                onClick={() => navigate(`/construcao/codigos/${c.id}`, { replace: true })}
              >
                <span className="cd-item-name">{c.name}</span>
                <span className="cd-item-meta muted">
                  {c.source ? (c.example ? 'Exemplo' : (c.filename ?? c.language)) : 'A cadastrar'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="cd-main">
        <header className="cd-head">
          <div>
            <h3 className="cd-title">
              {entry.name}
              {entry.example && <span className="tag">Arquivo demonstrativo</span>}
            </h3>
            <dl className="cd-meta">
              <div>
                <dt>Placa</dt>
                <dd>{entry.board ?? 'Não informada'}</dd>
              </div>
              <div>
                <dt>Linguagem</dt>
                <dd>{entry.language.toUpperCase()}</dd>
              </div>
              <div>
                <dt>Arquivo</dt>
                <dd>{entry.source ? filename : 'Não cadastrado'}</dd>
              </div>
            </dl>
          </div>
          {source !== null && (
            <div className="cd-actions">
              <button
                className="btn btn--ghost btn--sm"
                onClick={async () => {
                  const ok = await copyText(source);
                  setCopied(ok);
                  setTimeout(() => setCopied(false), 1800);
                }}
              >
                {copied ? 'Código copiado' : 'Copiar código'}
              </button>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => downloadBlob(new Blob([source], { type: 'text/plain;charset=utf-8' }), filename)}
              >
                Baixar {filename.split('.').pop()}
              </button>
            </div>
          )}
        </header>

        {entry.description ? (
          <p className="cd-desc">{entry.description}</p>
        ) : (
          <EmptySlot compact label="Descrição" hint={HINT} />
        )}

        <div className="cd-editor">
          {!entry.source ? (
            <EmptySlot label="Código-fonte ainda não cadastrado" hint={HINT} style={{ height: '100%' }} />
          ) : error ? (
            <EmptySlot label={error} hint={HINT} style={{ height: '100%' }} />
          ) : source === null ? (
            <p className="cd-loading muted">Carregando código…</p>
          ) : (
            <Editor
              value={source}
              language={entry.language === 'c' ? 'cpp' : entry.language}
              theme="battle-bots"
              loading={<p className="cd-loading muted">Carregando editor…</p>}
              onMount={(ed) => {
                editor.current = ed;
              }}
              options={{
                readOnly: true,
                domReadOnly: true,
                minimap: { enabled: false },
                fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace",
                fontSize: 13.5,
                lineHeight: 22,
                fontLigatures: true,
                scrollBeyondLastLine: false,
                renderLineHighlight: 'line',
                padding: { top: 18, bottom: 18 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                folding: true,
                bracketPairColorization: { enabled: false },
                guides: { bracketPairs: false, indentation: true },
                stickyScroll: { enabled: true },
                automaticLayout: true,
                contextmenu: true,
                overviewRulerBorder: false,
                scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
              }}
            />
          )}
        </div>
      </section>

      <aside className="cd-side" aria-label="Explicações">
        <div className="dg-block">
          <p className="dg-block-title">Seções explicadas</p>
          {entry.sections?.length ? (
            <ol className="cd-sections">
              {entry.sections.map((s, i) => (
                <li key={i}>
                  <button
                    className={`cd-section ${activeSection === i ? 'is-active' : ''}`}
                    onClick={() => focusSection(i)}
                    disabled={source === null}
                  >
                    <span className="cd-section-head">
                      <span>{s.title}</span>
                      <span className="muted">
                        Linhas {s.lines[0]}–{s.lines[1]}
                      </span>
                    </span>
                    <span className="cd-section-text">{s.text}</span>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <EmptySlot compact label="Explicações por seção" hint={HINT} />
          )}
        </div>
        <div className="dg-block">
          <p className="dg-block-title">Instruções de utilização</p>
          {entry.instructions?.length ? (
            <ol className="cd-steps">
              {entry.instructions.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ol>
          ) : (
            <EmptySlot compact label="Instruções" hint={HINT} />
          )}
        </div>
        <div className="dg-block">
          <p className="dg-block-title">Arquivos</p>
          {entry.downloads?.length ? (
            <ul className="dl-list">
              {entry.downloads.map((d) => (
                <li key={d.file}>
                  <a className="dl-link" href={asset(d.file)} download>
                    <span>{d.label}</span>
                    <span className="dl-ext">{d.file.split('.').pop()?.toUpperCase()}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <EmptySlot compact label="Arquivos adicionais" hint="Bibliotecas, esquemas ou projetos" />
          )}
        </div>
      </aside>
    </div>
  );
}
