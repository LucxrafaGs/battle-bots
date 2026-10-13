import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { SITE } from '@/data/site';
import { useUi } from '@/store/ui';
import { reducedMotion } from '@/lib/motion';
import { TLink } from './PageTransition';
import { getLenis } from './SmoothScroll';
import Mark from '../ui/Mark';
import RollText from '../ui/RollText';
import './Header.css';

const isActive = (pathname: string, to: string) =>
  to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);

export default function Header() {
  const { pathname } = useLocation();
  const booted = useUi((s) => s.booted);
  const menuOpen = useUi((s) => s.menuOpen);
  const setMenuOpen = useUi((s) => s.setMenuOpen);
  const header = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const introDone = useRef(false);

  // Entrada progressiva do menu após o loading
  useEffect(() => {
    if (!booted || introDone.current || !header.current) return;
    introDone.current = true;
    const items = header.current.querySelectorAll('.hd-reveal');
    if (reducedMotion()) {
      items.forEach((i) => ((i as HTMLElement).style.transform = 'none'));
      return;
    }
    animate(items, {
      translateY: ['110%', '0%'],
      duration: 1100,
      delay: stagger(60, { start: 250 }),
      ease: 'outExpo',
    });
  }, [booted]);

  // Esconde ao rolar para baixo, mostra ao rolar para cima
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = getLenis()?.scroll ?? window.scrollY;
      const el = header.current;
      if (!el) return;
      const down = y > lastY && y > 120;
      el.classList.toggle('is-hidden', down && !useUi.getState().menuOpen);
      el.classList.toggle('is-scrolled', y > 24);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    header.current?.classList.remove('is-hidden');
  }, [pathname]);

  // Menu móvel
  useEffect(() => {
    const el = overlay.current;
    if (!el) return;
    const links = el.querySelectorAll('.mm-link-inner');
    const meta = el.querySelectorAll('.mm-meta');
    const lenis = getLenis();
    if (menuOpen) {
      lenis?.stop();
      el.classList.add('is-open');
      if (reducedMotion()) return;
      animate(el, { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'], duration: 700, ease: 'inOutQuart' });
      animate(links, { translateY: ['110%', '0%'], duration: 900, delay: stagger(55, { start: 260 }), ease: 'outExpo' });
      animate(meta, { opacity: [0, 1], duration: 600, delay: 600 });
    } else if (el.classList.contains('is-open')) {
      lenis?.start();
      if (reducedMotion()) {
        el.classList.remove('is-open');
        return;
      }
      animate(el, { clipPath: ['inset(0 0 0% 0)', 'inset(0 0 100% 0)'], duration: 600, ease: 'inOutQuart' }).then(
        () => el.classList.remove('is-open'),
      );
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, setMenuOpen]);

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <header ref={header} className={`hd ${booted ? 'is-ready' : ''}`}>
        <TLink to="/" className="hd-brand" aria-label="Battle Bots — início" data-cursor-grow>
          <span className="hd-mask">
            <span className="hd-reveal hd-brand-inner">
              <Mark size={22} />
              <span className="hd-brand-text">Battle Bots</span>
            </span>
          </span>
        </TLink>

        <nav className="hd-nav" aria-label="Principal">
          <ul>
            {SITE.nav.map((item) => {
              const active = isActive(pathname, item.to);
              return (
                <li key={item.to} className="hd-mask">
                  <TLink
                    to={item.to}
                    className={`hd-link hd-reveal ${active ? 'is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <RollText>{item.label}</RollText>
                  </TLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <span className="hd-mask hd-menu-wrap">
          <button
            className="hd-menu-btn hd-reveal"
            aria-expanded={menuOpen}
            aria-controls="menu-movel"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="hd-menu-label">{menuOpen ? 'Fechar' : 'Menu'}</span>
            <span className={`hd-burger ${menuOpen ? 'is-x' : ''}`} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </span>
      </header>

      <div
        ref={overlay}
        id="menu-movel"
        className="mm"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Menu móvel">
          <ul>
            {SITE.nav.map((item) => (
              <li key={item.to} className="mm-item">
                <TLink
                  to={item.to}
                  className={`mm-link display ${isActive(pathname, item.to) ? 'is-active' : ''}`}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  <span className="mm-link-inner">{item.label}</span>
                </TLink>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mm-meta muted">{SITE.signature}</p>
      </div>
    </>
  );
}
