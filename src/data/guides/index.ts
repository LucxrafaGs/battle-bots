import type { GuideStep } from '@/types/content';

/* ==========================================================================
   GUIA DE MONTAGEM
   Etapas do guia na aba Construção › Montagem. Edite títulos, acrescente
   ou remova etapas livremente. Os campos `body`, `media` e `notes`
   começam vazios e devem receber o procedimento real.

   Exemplo de etapa preenchida:
   {
     id: 'laterais',
     title: 'Montagem das laterais',
     body: ['Primeiro parágrafo…', 'Segundo parágrafo…'],
     media: [
       { kind: 'image', src: 'midia/montagem/laterais-01.jpg', caption: 'Vista superior' },
       { kind: 'video', src: 'midia/montagem/laterais.mp4' },
       { kind: 'model', src: 'modelos/lateral-1-01.glb' },
     ],
     notes: ['Conferir o alinhamento antes de apertar.'],
   }
   ========================================================================== */

export const GUIDE_STEPS: GuideStep[] = [
  { id: 'preparacao', title: 'Preparação das peças' },
  { id: 'laterais', title: 'Montagem das laterais' },
  { id: 'frame', title: 'Instalação do frame central' },
  { id: 'internos', title: 'Fixação dos componentes internos' },
  { id: 'tampa', title: 'Instalação da tampa' },
  { id: 'verificacoes', title: 'Verificações finais' },
];
