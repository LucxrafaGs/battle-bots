import { Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ROUTES } from './routes';
import Loader from './components/layout/Loader';
import Header from './components/layout/Header';
import Cursor from './components/layout/Cursor';
import SmoothScroll from './components/layout/SmoothScroll';
import { TransitionProvider } from './components/layout/PageTransition';
import { useUi } from './store/ui';
import ErrorBoundary from './components/layout/ErrorBoundary';

const { home, builder, construcao, legado, edicao, sobre, notFound } = ROUTES;

function RouteTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const map: Record<string, string> = {
      '/': 'Battle Bots',
      '/montar': 'Montar Robô — Battle Bots',
      '/sobre': 'Sobre — Battle Bots',
      '/legado': 'Legado — Battle Bots',
    };
    let title = map[pathname];
    if (!title && pathname.startsWith('/construcao')) title = 'Construção — Battle Bots';
    if (!title && pathname.startsWith('/legado/'))
      title = `${decodeURIComponent(pathname.split('/')[2])} — Legado — Battle Bots`;
    document.title = title ?? 'Battle Bots';
  }, [pathname]);
  return null;
}

export default function App() {
  const booted = useUi((s) => s.booted);
  const { pathname } = useLocation();
  return (
    <TransitionProvider>
      <SmoothScroll />
      <RouteTitle />
      <Header />
      <main id="conteudo" aria-busy={!booted}>
        <ErrorBoundary resetKey={pathname}>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<home.Component />} />
            <Route path="/montar" element={<builder.Component />} />
            <Route path="/construcao/*" element={<construcao.Component />} />
            <Route path="/legado" element={<legado.Component />} />
            <Route path="/legado/:year" element={<edicao.Component />} />
            <Route path="/sobre" element={<sobre.Component />} />
            <Route path="*" element={<notFound.Component />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      <Loader />
      <Cursor />
    </TransitionProvider>
  );
}
