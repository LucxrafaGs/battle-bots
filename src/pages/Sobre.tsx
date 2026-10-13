import { useRef } from 'react';
import { ABOUT } from '@/data/about';
import { asset } from '@/lib/motion';
import { useReveal } from '@/hooks/useReveal';
import KineticTitle from '@/components/ui/KineticTitle';
import EmptySlot from '@/components/ui/EmptySlot';
import MediaWall from '@/components/ui/MediaWall';
import './Sobre.css';

const HINT = 'Preencher em src/data/about/index.ts';

function Text({ list, large }: { list?: string[]; large?: boolean }) {
  if (!list?.length) return null;
  return (
    <div className={`sb-text ${large ? 'sb-text--large' : ''}`} data-reveal>
      {list.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/* ==========================================================================
   SOBRE — espaço pessoal do professor.
   Conteúdo inicial: apenas marca e assinatura. Todo o resto é preenchido
   pelo próprio autor em src/data/about/index.ts.
   ========================================================================== */
export default function Sobre() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const a = ABOUT;

  return (
    <div className="page sb" ref={root}>
      <header className="sb-hero page-pad">
        <p className="sb-brand display" data-reveal>
          {a.brand}
        </p>
        <KineticTitle
          className="sb-title"
          label={a.signature}
          lines={[
            { text: 'Um projeto', className: 'sb-l1' },
            { text: 'feito por', className: 'sb-l2' },
            { text: 'Lucas', className: 'sb-l3' },
          ]}
          radius={240}
          stretch={[70, 110]}
          weight={[600, 900]}
          delay={100}
        />
      </header>

      <section className="sb-portrait page-pad" aria-label="Retrato e biografia">
        <div className="sb-photo" data-reveal>
          {a.photo ? (
            <img src={asset(a.photo)} alt={a.name ?? 'Retrato do professor'} />
          ) : (
            <EmptySlot label="Fotografia principal" hint={HINT} ratio="4/5" />
          )}
        </div>
        <div className="sb-bio">
          {a.name ? (
            <h2 className="sb-name display" data-reveal>
              {a.name}
            </h2>
          ) : (
            <EmptySlot compact label="Nome do professor" hint={HINT} />
          )}
          {a.biography?.length ? (
            <Text list={a.biography} />
          ) : (
            <EmptySlot label="Biografia" hint={HINT} style={{ minHeight: 220 }} />
          )}
        </div>
      </section>

      <section className="sb-sec page-pad">
        <h2 className="sec-title" data-reveal>
          Origem do projeto
        </h2>
        {a.origin?.length ? <Text list={a.origin} /> : <EmptySlot label="Origem do projeto" hint={HINT} style={{ minHeight: 180 }} />}
      </section>

      <section className="sb-sec page-pad">
        <h2 className="sec-title" data-reveal>
          Texto pessoal
        </h2>
        {a.personal?.length ? <Text list={a.personal} /> : <EmptySlot label="Texto pessoal" hint={HINT} style={{ minHeight: 180 }} />}
      </section>

      <section className="sb-message page-pad">
        <h2 className="sec-title" data-reveal>
          Mensagem aos ex-alunos
        </h2>
        {a.message?.length ? (
          <>
            <Text list={a.message} large />
            {a.messageSignoff?.length ? (
              <p className="sb-signoff" data-reveal>
                {a.messageSignoff.map((l, i) => (
                  <span key={i}>{l}</span>
                ))}
              </p>
            ) : null}
          </>
        ) : (
          <EmptySlot label="Mensagem aos ex-alunos" hint={HINT} style={{ minHeight: 280 }} />
        )}
      </section>

      <section className="sb-sec sb-sec--wide sb-mem page-pad">
        <h2 className="sec-title" data-reveal>
          Fotografias e lembranças
        </h2>
        {a.memories?.length ? (
          <MediaWall items={a.memories} />
        ) : (
          <div className="sb-mem-empty">
            <EmptySlot label="Fotografias e lembranças" hint={HINT} ratio="4/5" />
            <EmptySlot label="" ratio="1" />
            <EmptySlot label="" ratio="4/5" />
          </div>
        )}
      </section>

      <footer className="sb-foot page-pad">
        <p className="display sb-foot-brand">{a.brand}</p>
        <p className="muted">{a.signature}</p>
      </footer>
    </div>
  );
}
