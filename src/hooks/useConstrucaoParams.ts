import { useParams } from 'react-router-dom';

/** Lê /construcao/:aba/:item a partir do curinga da rota. */
export function useConstrucaoParams(): [string | undefined, string | undefined] {
  const rest = useParams()['*'] ?? '';
  const [tab, item] = rest.split('/').filter(Boolean).map(decodeURIComponent);
  return [tab, item];
}
