import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

/* ==========================================================================
   Visualizador técnico com zoom e deslocamento.
   Roda do mouse (zoom no cursor), arrastar, pinça no toque, duplo clique.
   ========================================================================== */

export interface PanZoomHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
  actual: () => void;
}

interface Props {
  src: string;
  alt: string;
  onScale?: (s: number) => void;
  /** Insere o SVG no documento (permite destacar elementos e usar as fontes do site). */
  inline?: boolean;
}

const MIN = 0.05;
const MAX = 16;

const PanZoom = forwardRef<PanZoomHandle, Props>(function PanZoom({ src, alt, onScale, inline }, ref) {
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLElement | null>(null);
  const [markup, setMarkup] = useState<string | null>(null);
  const t = useRef({ x: 0, y: 0, s: 1 });
  const target = useRef({ x: 0, y: 0, s: 1 });
  const raf = useRef(0);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; s: number } | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const apply = useCallback(() => {
    const el = img.current;
    if (!el) return;
    const { x, y, s } = t.current;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
  }, []);

  const animateTo = useCallback(
    (next: { x: number; y: number; s: number }, instant = false) => {
      target.current = next;
      onScale?.(next.s);
      if (instant) {
        t.current = { ...next };
        apply();
        return;
      }
      cancelAnimationFrame(raf.current);
      const step = () => {
        const c = t.current;
        const k = 0.22;
        c.x += (target.current.x - c.x) * k;
        c.y += (target.current.y - c.y) * k;
        c.s += (target.current.s - c.s) * k;
        apply();
        if (
          Math.abs(target.current.x - c.x) > 0.3 ||
          Math.abs(target.current.y - c.y) > 0.3 ||
          Math.abs(target.current.s - c.s) > 0.0005
        )
          raf.current = requestAnimationFrame(step);
        else {
          t.current = { ...target.current };
          apply();
        }
      };
      raf.current = requestAnimationFrame(step);
    },
    [apply, onScale],
  );

  const fitScale = useCallback(() => {
    const b = box.current;
    if (!b || !natural) return { x: 0, y: 0, s: 1 };
    const pad = 32;
    const s = Math.min((b.clientWidth - pad * 2) / natural.w, (b.clientHeight - pad * 2) / natural.h);
    return {
      s,
      x: (b.clientWidth - natural.w * s) / 2,
      y: (b.clientHeight - natural.h * s) / 2,
    };
  }, [natural]);

  const zoomAt = useCallback(
    (factor: number, cx?: number, cy?: number, instant = false) => {
      const b = box.current;
      if (!b) return;
      const cur = target.current;
      const px = cx ?? b.clientWidth / 2;
      const py = cy ?? b.clientHeight / 2;
      const s = Math.min(MAX, Math.max(MIN, cur.s * factor));
      const f = s / cur.s;
      animateTo({ s, x: px - (px - cur.x) * f, y: py - (py - cur.y) * f }, instant);
    },
    [animateTo],
  );

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => zoomAt(1.5),
      zoomOut: () => zoomAt(1 / 1.5),
      fit: () => animateTo(fitScale()),
      actual: () => {
        const b = box.current;
        if (!b || !natural) return;
        animateTo({ s: 1, x: (b.clientWidth - natural.w) / 2, y: (b.clientHeight - natural.h) / 2 });
      },
    }),
    [zoomAt, animateTo, fitScale, natural],
  );

  // Ajusta ao carregar e ao redimensionar
  useEffect(() => {
    if (!natural) return;
    animateTo(fitScale(), true);
    const ro = new ResizeObserver(() => animateTo(fitScale(), true));
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [natural, fitScale, animateTo]);

  useEffect(() => {
    setNatural(null);
    setMarkup(null);
    if (!inline) return;
    let alive = true;
    fetch(src)
      .then((r) => r.text())
      .then((text) => {
        if (!alive) return;
        const tag = text.match(/<svg[^>]*>/)?.[0] ?? '';
        const num = (k: string) => Number(tag.match(new RegExp(`\\s${k}="([\\d.]+)"`))?.[1]);
        const vb = tag.match(/viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/);
        const w = num('width') || Number(vb?.[1]) || 1600;
        const h = num('height') || Number(vb?.[2]) || 1000;
        setMarkup(text.replace(/<\?xml[^>]*>/, ''));
        setNatural({ w, h });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [src, inline]);

  useEffect(() => {
    const b = box.current;
    if (!b) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = b.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018));
      zoomAt(factor, e.clientX - r.left, e.clientY - r.top, true);
    };
    b.addEventListener('wheel', onWheel, { passive: false });
    return () => b.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const release = useCallback((id?: number) => {
    if (id === undefined) pointers.current.clear();
    else pointers.current.delete(id);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) setDragging(false);
  }, []);

  // Soltar o botão fora da área (ou perder o foco da janela) também encerra o arraste.
  useEffect(() => {
    if (!dragging) return;
    const end = (e: PointerEvent) => release(e.pointerId);
    const reset = () => release();
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('blur', reset);
    };
  }, [dragging, release]);

  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.pointerType === 'mouse') e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, c] = Array.from(pointers.current.values());
      pinch.current = { d: Math.hypot(a.x - c.x, a.y - c.y), s: target.current.s };
    }
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    if (e.pointerType === 'mouse' && e.buttons === 0) {
      release(e.pointerId);
      return;
    }
    const next = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, next);
    const b = box.current!;
    const r = b.getBoundingClientRect();
    if (pointers.current.size === 2 && pinch.current) {
      const [a, c] = Array.from(pointers.current.values());
      const d = Math.hypot(a.x - c.x, a.y - c.y);
      const desired = pinch.current.s * (d / pinch.current.d);
      zoomAt(desired / target.current.s, (a.x + c.x) / 2 - r.left, (a.y + c.y) / 2 - r.top, true);
      return;
    }
    const cur = target.current;
    animateTo({ ...cur, x: cur.x + (next.x - prev.x), y: cur.y + (next.y - prev.y) }, true);
  };
  const onUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    release(e.pointerId);
  };

  return (
    <div
      ref={box}
      className={`pz ${dragging ? 'is-dragging' : ''}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onLostPointerCapture={(e) => release(e.pointerId)}
      onDragStart={(e) => e.preventDefault()}
      onDoubleClick={(e) => {
        const r = box.current!.getBoundingClientRect();
        zoomAt(2, e.clientX - r.left, e.clientY - r.top);
      }}
      data-cursor="Arrastar"
      tabIndex={0}
      role="img"
      aria-label={alt}
      onKeyDown={(e) => {
        const cur = target.current;
        if (e.key === '+' || e.key === '=') zoomAt(1.25);
        else if (e.key === '-') zoomAt(0.8);
        else if (e.key === '0') animateTo(fitScale());
        else if (e.key === 'ArrowLeft') animateTo({ ...cur, x: cur.x + 60 });
        else if (e.key === 'ArrowRight') animateTo({ ...cur, x: cur.x - 60 });
        else if (e.key === 'ArrowUp') animateTo({ ...cur, y: cur.y + 60 });
        else if (e.key === 'ArrowDown') animateTo({ ...cur, y: cur.y - 60 });
        else return;
        e.preventDefault();
      }}
    >
      {inline ? (
        <div
          ref={(el) => {
            img.current = el;
          }}
          className={`pz-svg ${natural ? 'is-ready' : ''}`}
          style={natural ? { width: natural.w, height: natural.h } : undefined}
          dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
        />
      ) : (
      <img
        ref={(el) => {
          img.current = el;
        }}
        src={src}
        alt=""
        draggable={false}
        className={natural ? 'is-ready' : ''}
        onLoad={(e) => {
          const el = e.currentTarget;
          // SVG sem dimensões intrínsecas recebe um tamanho base
          setNatural({ w: el.naturalWidth || 1600, h: el.naturalHeight || 1000 });
        }}
        style={natural ? { width: natural.w, height: natural.h } : undefined}
      />
      )}
    </div>
  );
});

export default PanZoom;
