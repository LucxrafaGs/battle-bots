import { useState } from 'react';
import type { MediaItem } from '@/types/content';
import MediaView from './MediaView';
import Lightbox from './Lightbox';

/** Ritmo da composição editorial da galeria (repete a cada 7 itens). */
const RHYTHM = ['g-wide', 'g-tall', 'g-sq', 'g-sq', 'g-tall', 'g-wide', 'g-full'];

/* Galeria editorial com lightbox. */
export default function Gallery({ items }: { items: MediaItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <ul className="gal">
        {items.map((m, i) => (
          <li key={i} className={`gal-item ${RHYTHM[i % RHYTHM.length]}`} data-reveal style={{ ['--reveal-delay' as string]: `${(i % 3) * 90}ms` }}>
            <button className="gal-btn" onClick={() => setOpen(i)} data-cursor="Ampliar" aria-label={m.caption ? `Ampliar: ${m.caption}` : `Ampliar item ${i + 1}`}>
              <MediaView item={m} controls={false} />
            </button>
            {m.caption && <p className="gal-cap">{m.caption}</p>}
          </li>
        ))}
      </ul>
      <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}

