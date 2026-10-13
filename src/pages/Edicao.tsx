import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { EDITIONS } from '@/data/legacy';
import { editionSummary } from '@/lib/legacy';
import { useReveal } from '@/hooks/useReveal';
import KineticTitle from '@/components/ui/KineticTitle';
import EmptySlot from '@/components/ui/EmptySlot';
import MediaWall from '@/components/ui/MediaWall';
import { TLink } from '@/components/layout/PageTransition';
import NotFound from './NotFound';
import './Edicao.css';

function Paragraphs({ list }: { list: string[] }) {
  return (
    <div className="ed-text" data-reveal>
      {list.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

export default function EdicaoRoute() {
  const { year } = useParams();
  return <Edicao key={year} year={year} />;
}

function Edicao({ year }: { year?: string }) {
  const index = EDITIONS.findIndex((e) => e.year === year);
  const root = useRef<HTMLDivElement>(null);
  useReveal(root, [year]);
  if (index < 0) return <NotFound />;

  const e = EDITIONS[index];
  const prev = EDITIONS[index - 1];
  const next = EDITIONS[index + 1];

  return (
    <div className="page ed" ref={root}>
      <header className="ed-hero page-pad">
        <TLink to="/legado" className="ed-back">
          Legado
        </TLink>
        <KineticTitle
          className="ed-year"
          lines={[{ text: e.year }]}
          radius={300}
          stretch={[62, 125]}
          weight={[800, 900]}
          label={`Battle Bots ${e.year}`}
        />
        <p className="ed-count muted">{editionSummary(e)}</p>
      </header>

      {e.photos?.length ? (
        <section className="ed-sec ed-wall-sec page-pad" aria-label="Fotos e vídeos">
          <MediaWall items={e.photos} />
        </section>
      ) : null}

      <section className="ed-sec page-pad ed-story" aria-label="Texto da edição">
        <h2 className="sec-title ed-sec-title" data-reveal>
          {e.title ?? `Battle Bots ${e.year}`}
        </h2>
        {e.description?.length ? (
          <Paragraphs list={e.description} />
        ) : (
          <EmptySlot label="Texto da edição" hint={`Em breve · src/data/legacy/index.ts (${e.year})`} />
        )}
      </section>

      <nav className="ed-nav page-pad" aria-label="Outras edições">
        {prev ? (
          <TLink to={`/legado/${prev.year}`} className="ed-nav-link" data-cursor="Abrir">
            <span className="muted">Edição anterior</span>
            <span className="ed-nav-year display">{prev.year}</span>
          </TLink>
        ) : (
          <span />
        )}
        {next ? (
          <TLink to={`/legado/${next.year}`} className="ed-nav-link ed-nav-link--next" data-cursor="Abrir">
            <span className="muted">Próxima edição</span>
            <span className="ed-nav-year display">{next.year}</span>
          </TLink>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

