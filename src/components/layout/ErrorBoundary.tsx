import { Component, type ReactNode } from 'react';

/* Captura falhas de página (ex.: arquivo de rota indisponível após atualização). */
export default class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidUpdate(prev: { resetKey?: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  componentDidCatch(error: Error) {
    console.error(error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="page page-pad" style={{ display: 'grid', alignContent: 'center', gap: 20, minHeight: '80vh' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-2xl)' }}>
          Esta página não carregou
        </h1>
        <p className="muted" style={{ maxWidth: '52ch' }}>
          {this.state.error.message || 'Ocorreu um erro inesperado.'} Recarregue para tentar novamente.
        </p>
        <div>
          <button className="btn btn--primary" onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}
