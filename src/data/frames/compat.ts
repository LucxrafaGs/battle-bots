import type { CompatNote } from '@/types/content';

/* ==========================================================================
   AVISOS DE COMPATIBILIDADE
   Gerados a partir da checagem de interferência no CAD (sólidos e volumes
   varridos pelas armas). Só entram aqui conflitos físicos reais.
   ========================================================================== */
export const COMPAT_NOTES: CompatNote[] = [
  { a: 'FC-02', b: 'TP-04', reason: 'A barra giratória passa pelas torres e pelo martelo.' },
  { a: 'FC-03', b: 'TP-04', reason: 'O disco giratório passa pelas torres e pelo martelo.' },
  { a: 'FC-04', b: 'TP-04', reason: 'O martelo atinge o tambor ao descer.' },
  { a: 'FC-02', b: 'TP-01', reason: 'O furo Ø8,5 da tampa original não passa o adaptador M6 do A2212. Use uma tampa com furo Ø14.' },
  { a: 'FC-03', b: 'TP-01', reason: 'O furo Ø8,5 da tampa original não passa o adaptador M6 do A2212. Use uma tampa com furo Ø14.' },
];

export function compatIssues(ids: string[]): CompatNote[] {
  const set = new Set(ids);
  return COMPAT_NOTES.filter((n) => set.has(n.a) && set.has(n.b));
}
