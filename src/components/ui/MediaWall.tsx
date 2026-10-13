import { useState } from 'react';
import type { MediaItem } from '@/types/content';
import { asset } from '@/lib/motion';
import Lightbox from './Lightbox';
import './MediaWall.css';

/* Mural de fotos e vídeos em colunas, respeitando a proporção original
   de cada arquivo. Vídeos mostram a capa e abrem no lightbox. */
export default function MediaWall({ items }: { items: MediaItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <ul className="wall">
        {items.map((m, i) => (
          <li key={m.src} className="wall-item" data-reveal style={{ ['--reveal-delay' as string]: `${(i % 4) * 70}ms` }}>
            <button
              className="wall-btn"
              onClick={() => setOpen(i)}
              data-cursor={m.kind === 'video' ? 'Assistir' : 'Ampliar'}
              aria-label={m.kind === 'video' ? `Assistir vídeo ${i + 1}` : `Ampliar foto ${i + 1}`}
              style={{ aspectRatio: m.ratio }}
            >
              <img src={asset(m.kind === 'video' ? (m.poster ?? '') : m.src)} alt={m.caption ?? ''} loading="lazy" decoding="async" draggable={false} />
              {m.kind === 'video' && (
                <span className="wall-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
