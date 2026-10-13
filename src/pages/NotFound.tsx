import KineticTitle from '@/components/ui/KineticTitle';
import { TLink } from '@/components/layout/PageTransition';

export default function NotFound() {
  return (
    <div className="page page-pad" style={{ display: 'grid', alignContent: 'center', gap: 28 }}>
      <KineticTitle className="phead-title" lines={[{ text: 'Peça não encontrada' }]} radius={200} stretch={[80, 120]} />
      <p className="muted">Este endereço não corresponde a nenhuma página do Battle Bots.</p>
      <div>
        <TLink to="/" className="btn btn--primary">
          Voltar ao início
        </TLink>
      </div>
    </div>
  );
}
