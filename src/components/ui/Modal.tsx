import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { animate, stagger } from 'animejs';
import { reducedMotion } from '@/lib/motion';
import { getLenis } from '../layout/SmoothScroll';
import './Modal.css';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** 'center' para diálogos, 'side' para gaveta lateral. */
  variant?: 'center' | 'side';
  wide?: boolean;
}

export default function Modal({ open, onClose, title, children, footer, variant = 'center', wide }: Props) {
  const [mounted, setMounted] = useState(open);
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const titleId = useRef(`modal-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    if (open) {
      restore.current = document.activeElement as HTMLElement;
      setMounted(true);
    }
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const p = panel.current;
    const b = backdrop.current;
    if (!p || !b) return;
    const reduce = reducedMotion();
    const from = variant === 'side' ? 'inset(0 0 0 100%)' : 'inset(50% 0 50% 0)';
    if (open) {
      getLenis()?.stop();
      if (!reduce) {
        animate(b, { opacity: [0, 1], duration: 400, ease: 'out(3)' });
        animate(p, { clipPath: [from, 'inset(0% 0% 0% 0%)'], duration: 720, ease: 'inOutQuart' });
        animate(p.querySelectorAll('.md-stagger'), {
          translateY: [24, 0],
          opacity: [0, 1],
          duration: 700,
          delay: stagger(50, { start: 260 }),
          ease: 'outExpo',
        });
      }
      const focusable = p.querySelector<HTMLElement>(
        'input, button:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      setTimeout(() => focusable?.focus(), reduce ? 0 : 200);
    } else {
      getLenis()?.start();
      const done = () => {
        setMounted(false);
        restore.current?.focus?.();
      };
      if (reduce) return done();
      animate(b, { opacity: [1, 0], duration: 380, ease: 'linear' });
      animate(p, { clipPath: ['inset(0% 0% 0% 0%)', from], duration: 480, ease: 'inQuart' }).then(done);
    }
  }, [open, mounted, variant]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panel.current) {
        const items = Array.from(
          panel.current.querySelectorAll<HTMLElement>(
            'input, button:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <div className={`md md--${variant}`}>
      <div ref={backdrop} className="md-backdrop" onClick={onClose} />
      <div
        ref={panel}
        className={`md-panel ${wide ? 'md-panel--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId.current}
        data-lenis-prevent
      >
        <header className="md-head">
          <h2 id={titleId.current} className="md-title display">
            {title}
          </h2>
          <button className="md-close" onClick={onClose} aria-label="Fechar">
            <span aria-hidden="true" />
          </button>
        </header>
        <div className="md-body">{children}</div>
        {footer && <footer className="md-foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
