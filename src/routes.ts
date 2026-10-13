import { lazy, type ComponentType } from 'react';

/* Rotas com carregamento sob demanda e pré-carregamento antes da transição. */

type Loader = () => Promise<{ default: ComponentType }>;

function route(loader: Loader) {
  let promise: Promise<{ default: ComponentType }> | null = null;
  const load = () => (promise ??= loader());
  return { Component: lazy(load), preload: load };
}

export const ROUTES = {
  home: route(() => import('@/pages/Home')),
  builder: route(() => import('@/pages/Builder')),
  construcao: route(() => import('@/pages/Construcao')),
  legado: route(() => import('@/pages/Legado')),
  edicao: route(() => import('@/pages/Edicao')),
  sobre: route(() => import('@/pages/Sobre')),
  notFound: route(() => import('@/pages/NotFound')),
};

/** Pré-carrega o código da página de destino. */
export function preloadPath(path: string) {
  const p = path.split('?')[0];
  if (p === '/' || p === '') return ROUTES.home.preload();
  if (p.startsWith('/montar')) return ROUTES.builder.preload();
  if (p.startsWith('/construcao')) return ROUTES.construcao.preload();
  if (/^\/legado\/.+/.test(p)) return ROUTES.edicao.preload();
  if (p.startsWith('/legado')) return ROUTES.legado.preload();
  if (p.startsWith('/sobre')) return ROUTES.sobre.preload();
  return ROUTES.notFound.preload();
}

/** Rótulo exibido na máscara de transição. */
export function labelForPath(path: string) {
  const p = path.split('?')[0];
  if (p === '/' || p === '') return 'Início';
  if (p.startsWith('/montar')) return 'Montar Robô';
  if (p.startsWith('/construcao')) return 'Construção';
  const year = p.match(/^\/legado\/([^/]+)/);
  if (year) return decodeURIComponent(year[1]);
  if (p.startsWith('/legado')) return 'Legado';
  if (p.startsWith('/sobre')) return 'Sobre';
  return 'Battle Bots';
}
