import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { animate } from 'animejs';
import type { MediaItem } from '@/types/content';
import { reducedMotion } from '@/lib/motion';
import { getLenis } from '../layout/SmoothScroll';
import MediaView from './MediaView';
import './Lightbox.css';

/* Visualizador em tela cheia com navegação por setas, teclado e toque. */
export default function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: MediaItem[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const dir = useRef(1);
  const touch = useRef<number | null>(null);
  const open = index !== null;

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      dir.current = delta;
      onIndex((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    getLenis()?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      getLenis()?.start();
    };
  }, [open, go, onClose]);

  useEffect(() => {
    if (index === null || !stage.current || reducedMotion()) return;
    animate(stage.current, {
      clipPath: [dir.current > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', 'inset(0 0% 0 0%)'],
      duration: 760,
      ease: 'inOutQuart',
    });
    animate(stage.current.querySelectorAll('img, video'), { scale: [1.12, 1], duration: 1200, ease: 'outExpo' });
  }, [index]);

  if (index === null) return null;
  const item = items[index];
  return createPortal(
    <div className="lb" role="dialog" aria-modal="true" aria-label="Galeria">
      <div className="lb-bar">
        <span className="lb-count">
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
        <button className="lb-close" onClick={onClose} autoFocus>
          Fechar
        </button>
      </div>
      <div
        className="lb-stage"
        ref={stage}
        key={index}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
      >
        <MediaView item={item} fit="contain" className="lb-media" />
      </div>
      {item.caption && <p className="lb-caption">{item.caption}</p>}
      {items.length > 1 && (
        <>
          <button className="lb-nav lb-nav--prev" onClick={() => go(-1)} aria-label="Anterior">
            Anterior
          </button>
          <button className="lb-nav lb-nav--next" onClick={() => go(1)} aria-label="Próxima">
            Próxima
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
