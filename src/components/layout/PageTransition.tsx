import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useHref, useLocation, useNavigate } from 'react-router-dom';
import { animate, createTimeline, stagger } from 'animejs';
import { labelForPath, preloadPath } from '@/routes';
import { useUi } from '@/store/ui';
import { reducedMotion } from '@/lib/motion';
import { scrollToTop } from './SmoothScroll';
import './PageTransition.css';

/* ==========================================================================
   Transição entre páginas.
   Duas chapas (como as laterais do robô) deslizam e se encaixam no centro,
   o nome da página de destino aparece na junta, a rota troca enquanto a
   tela está coberta e as chapas se afastam para revelar a nova página.
   Cliques rápidos não empilham animações: vale sempre o último destino.
   ========================================================================== */

interface Ctx {
  go: (to: string) => void;
}

const TransitionCtx = createContext<Ctx>({ go: () => undefined });
export const useTransitionNav = () => useContext(TransitionCtx);

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const setCovered = useUi((s) => s.setCovered);
  const reveal = useUi((s) => s.reveal);
  const setMenuOpen = useUi((s) => s.setMenuOpen);

  const root = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const seam = useRef<HTMLDivElement>(null);
  const labelEl = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const pending = useRef<string | null>(null);
  const [label, setLabel] = useState('');
  const currentPath = useRef(location.pathname);
  currentPath.current = location.pathname;

  const run = useCallback(
    async (to: string) => {
      busy.current = true;
      pending.current = null;
      setMenuOpen(false);
      setLabel(labelForPath(to));
      const preload = preloadPath(to);
      const reduce = reducedMotion();
      const el = root.current!;
      el.style.visibility = 'visible';
      setCovered(true);
      await new Promise((r) => requestAnimationFrame(r));

      // 1. Cobrir
      if (reduce) {
        await animate(el, { opacity: [0, 1], duration: 160, ease: 'linear' }).then(() => undefined);
      } else {
        el.style.opacity = '1';
        const chars = labelEl.current?.querySelectorAll('.pt-char') ?? [];
        const tl = createTimeline({ defaults: { ease: 'inOutQuart' } });
        tl.add(left.current!, { translateX: ['-101%', '0%'], duration: 640 }, 0)
          .add(right.current!, { translateX: ['101%', '0%'], duration: 640 }, 0)
          .add(seam.current!, { scaleY: [0, 1], duration: 420, ease: 'outExpo' }, 520)
          .add(chars, { translateY: ['105%', '0%'], duration: 620, delay: stagger(22), ease: 'outExpo' }, 430);
        await tl.then(() => undefined);
      }

      // 2. Trocar a rota enquanto a tela está coberta
      try {
        await preload;
      } catch {
        /* a rota mostra o próprio erro */
      }
      const target = pending.current ?? to;
      pending.current = null;
      navigate(target);
      scrollToTop();
      await nextFrame();
      if (!reduce) await new Promise((r) => setTimeout(r, 120));

      // 3. Revelar
      reveal();
      if (reduce) {
        await animate(el, { opacity: [1, 0], duration: 200, ease: 'linear' }).then(() => undefined);
      } else {
        const chars = labelEl.current?.querySelectorAll('.pt-char') ?? [];
        const tl = createTimeline({ defaults: { ease: 'inOutQuart' } });
        tl.add(chars, { translateY: ['0%', '-105%'], duration: 380, delay: stagger(14), ease: 'inQuart' }, 0)
          .add(seam.current!, { scaleY: [1, 0], duration: 300, ease: 'inQuart' }, 120)
          .add(left.current!, { translateX: ['0%', '-101%'], duration: 760 }, 260)
          .add(right.current!, { translateX: ['0%', '101%'], duration: 760 }, 260);
        await tl.then(() => undefined);
      }
      el.style.visibility = 'hidden';
      busy.current = false;

      // Um novo destino pedido durante a revelação
      const next = pending.current as string | null;
      if (next && next !== currentPath.current) run(next);
    },
    [navigate, reveal, setCovered, setMenuOpen],
  );

  const go = useCallback(
    (to: string) => {
      if (busy.current) {
        pending.current = to;
        return;
      }
      if (to === currentPath.current) {
        setMenuOpen(false);
        scrollToTop(true);
        return;
      }
      run(to);
    },
    [run, setMenuOpen],
  );

  return (
    <TransitionCtx.Provider value={{ go }}>
      {children}
      <div ref={root} className="pt" aria-hidden="true" style={{ visibility: 'hidden' }}>
        <div ref={left} className="pt-plate pt-plate--l" />
        <div ref={right} className="pt-plate pt-plate--r" />
        <div ref={seam} className="pt-seam" />
        <div ref={labelEl} className="pt-label display" key={label}>
          {Array.from(label).map((c, i) => (
            <span key={i} className="pt-char-mask">
              <span className="pt-char">{c === ' ' ? ' ' : c}</span>
            </span>
          ))}
        </div>
      </div>
    </TransitionCtx.Provider>
  );
}

type TLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string };

/** Link interno que usa a transição de página. */
export function TLink({ to, onClick, children, ...rest }: TLinkProps) {
  const href = useHref(to);
  const { go } = useTransitionNav();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(to);
  };
  return (
    <a href={href} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
