import { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import { reducedMotion } from '@/lib/motion';

/* Palavra que troca com máscara: a anterior sai para cima e a nova sobe. */
export default function SwapWord({ text, className = '' }: { text: string; className?: string }) {
  const [items, setItems] = useState([{ text, key: 0 }]);
  const key = useRef(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (items[items.length - 1].text === text) return;
    key.current += 1;
    setItems((prev) => [...prev.slice(-1), { text, key: key.current }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    const el = root.current;
    if (!el || items.length < 2) return;
    const [old, next] = Array.from(el.querySelectorAll<HTMLElement>('.sw-word'));
    if (reducedMotion()) {
      setItems((p) => p.slice(-1));
      return;
    }
    const oldChars = old.querySelectorAll('.sw-char');
    const newChars = next.querySelectorAll('.sw-char');
    animate(oldChars, { translateY: ['0%', '-105%'], duration: 520, delay: stagger(14), ease: 'inQuart' });
    const a = animate(newChars, {
      translateY: ['105%', '0%'],
      duration: 900,
      delay: stagger(20, { start: 160 }),
      ease: 'outExpo',
    });
    a.then(() => setItems((p) => p.slice(-1)));
    return () => {
      a.cancel();
    };
  }, [items]);

  return (
    <div ref={root} className={`sw ${className}`} aria-hidden="true">
      {items.map((it) => (
        <span key={it.key} className="sw-word">
          {Array.from(it.text).map((c, i) => (
            <span key={i} className="sw-mask">
              <span className="sw-char">{c === ' ' ? ' ' : c}</span>
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}
