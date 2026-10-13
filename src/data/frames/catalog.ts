import type { Combination, ModuleCategory, ModuleDefinition } from '@/types/content';
import { STANDARD_ID } from './standard';

/* ==========================================================================
   CATÁLOGO DE MÓDULOS
   --------------------------------------------------------------------------
   Base: projeto Fusion “Robo 02”. Os módulos 01 são as peças originais;
   as demais são variações feitas sobre elas sem alterar encaixes, baía da
   arma nem o compartimento do motor DC.

   Para adicionar uma peça:
     1. Modelo de visualização (GLB) em  public/modelos/<ID>.glb
        — exportado já na posição do robô (ver docs/PADRAO-MODULAR.md).
        Se não houver GLB, o próprio STL é usado para visualizar.
     2. STL de impressão em              public/stl/<ID>/<arquivo>.stl
     3. Miniatura (opcional)             public/miniaturas/<ID>.webp
     4. Acrescente um objeto à lista abaixo. Peças extras (ex.: a arma de
        um frame) vão em `extraStl` e entram no ZIP da exportação.

   Não é preciso editar nenhum componente React.
   ========================================================================== */

export const MODULES: ModuleDefinition[] = [
  {
    id: 'L1-01',
    category: 'lateral1',
    name: 'Lateral 1 — Original',
    standard: STANDARD_ID,
    model: 'modelos/L1-01.glb',
    stl: 'stl/L1-01/lateral-1.stl',
    thumbnail: 'miniaturas/L1-01.webp',
    specs: {
      'Origem': 'Projeto Robo 02 (Fusion)',
      'Motor': 'Motor DC amarelo com redução (TT)',
    },
  },
  {
    id: 'L2-01',
    category: 'lateral2',
    name: 'Lateral 2 — Original',
    standard: STANDARD_ID,
    model: 'modelos/L2-01.glb',
    stl: 'stl/L2-01/lateral-2.stl',
    thumbnail: 'miniaturas/L2-01.webp',
    specs: {
      'Origem': 'Projeto Robo 02 (Fusion)',
      'Motor': 'Motor DC amarelo com redução (TT)',
    },
  },
  {
    id: 'L1-02',
    category: 'lateral1',
    name: 'Lateral 1 — Arco',
    standard: STANDARD_ID,
    model: 'modelos/L1-02.glb',
    stl: 'stl/L1-02/lateral-1.stl',
    thumbnail: 'miniaturas/L1-02.webp',
    specs: {
      'Blindagem': 'Face externa em arco + cantos curvos',
      'Motor': 'Motor DC amarelo com redução (TT)',
    },
  },
  {
    id: 'L2-02',
    category: 'lateral2',
    name: 'Lateral 2 — Arco',
    standard: STANDARD_ID,
    model: 'modelos/L2-02.glb',
    stl: 'stl/L2-02/lateral-2.stl',
    thumbnail: 'miniaturas/L2-02.webp',
    specs: {
      'Blindagem': 'Face externa em arco + cantos curvos',
      'Motor': 'Motor DC amarelo com redução (TT)',
    },
  },
  {
    id: 'L1-03',
    category: 'lateral1',
    name: 'Lateral 1 — Cunha',
    standard: STANDARD_ID,
    model: 'modelos/L1-03.glb',
    stl: 'stl/L1-03/lateral-1.stl',
    thumbnail: 'miniaturas/L1-03.webp',
    specs: {
      'Blindagem': 'Parede inclinada, 11 mm mais larga na base',
      'Motor': 'Motor DC amarelo com redução (TT)',
    },
  },
  {
    id: 'L2-03',
    category: 'lateral2',
    name: 'Lateral 2 — Cunha',
    standard: STANDARD_ID,
    model: 'modelos/L2-03.glb',
    stl: 'stl/L2-03/lateral-2.stl',
    thumbnail: 'miniaturas/L2-03.webp',
    specs: {
      'Blindagem': 'Parede inclinada, 11 mm mais larga na base',
      'Motor': 'Motor DC amarelo com redução (TT)',
    },
  },
  {
    id: 'L1-04',
    category: 'lateral1',
    name: 'Lateral 1 — Facetada',
    standard: STANDARD_ID,
    model: 'modelos/L1-04.glb',
    stl: 'stl/L1-04/lateral-1.stl',
    thumbnail: 'miniaturas/L1-04.webp',
    specs: {
      'Blindagem': 'Facetas angulares + chanfro superior 45°',
      'Motor': 'Motor DC amarelo com redução (TT)',
    },
  },
  {
    id: 'L2-04',
    category: 'lateral2',
    name: 'Lateral 2 — Facetada',
    standard: STANDARD_ID,
    model: 'modelos/L2-04.glb',
    stl: 'stl/L2-04/lateral-2.stl',
    thumbnail: 'miniaturas/L2-04.webp',
    specs: {
      'Blindagem': 'Facetas angulares + chanfro superior 45°',
      'Motor': 'Motor DC amarelo com redução (TT)',
    },
  },
  {
    id: 'L1-05',
    category: 'lateral1',
    name: 'Lateral 1 — Nervurada',
    standard: STANDARD_ID,
    model: 'modelos/L1-05.glb',
    stl: 'stl/L1-05/lateral-1.stl',
    thumbnail: 'miniaturas/L1-05.webp',
    specs: {
      'Blindagem': '7 nervuras verticais + cinta central',
      'Motor': 'Motor DC amarelo com redução (TT)',
    },
  },
  {
    id: 'L2-05',
    category: 'lateral2',
    name: 'Lateral 2 — Nervurada',
    standard: STANDARD_ID,
    model: 'modelos/L2-05.glb',
    stl: 'stl/L2-05/lateral-2.stl',
    thumbnail: 'miniaturas/L2-05.webp',
    specs: {
      'Blindagem': '7 nervuras verticais + cinta central',
      'Motor': 'Motor DC amarelo com redução (TT)',
    },
  },
  {
    id: 'FC-01',
    category: 'frame',
    name: 'Frame Central — Original',
    standard: STANDARD_ID,
    model: 'modelos/FC-01.glb',
    stl: 'stl/FC-01/frame-central.stl',
    thumbnail: 'miniaturas/FC-01.webp',
    specs: {
      'Origem': 'Projeto Robo 02 (Fusion)',
      'Arma': 'Baía com assento Ø22 para A2212 vertical',
    },
  },
  {
    id: 'FC-02',
    category: 'frame',
    name: 'Frame Central — Barra horizontal',
    standard: STANDARD_ID,
    model: 'modelos/FC-02.glb',
    stl: 'stl/FC-02/frame-central.stl',
    extraStl: [
      { label: 'Arma — barra', file: 'stl/FC-02/arma-barra.stl', filename: 'arma-barra.stl' },
    ],
    thumbnail: 'miniaturas/FC-02.webp',
    specs: {
      'Arma': 'Barra giratória 150 mm sobre a tampa',
      'Motor da arma': 'A2212 (1000–1400 KV) vertical na baía',
      'Fixação': '4× M3 (padrão 16/19 mm) + adaptador M6 do motor',
      'Impacto': '2× parafusos M4 nas pontas',
      'Tampa': 'Usar tampa com furo Ø14 (Ventilada ou Nervurada)',
    },
  },
  {
    id: 'FC-03',
    category: 'frame',
    name: 'Frame Central — Disco horizontal',
    standard: STANDARD_ID,
    model: 'modelos/FC-03.glb',
    stl: 'stl/FC-03/frame-central.stl',
    extraStl: [
      { label: 'Arma — disco', file: 'stl/FC-03/arma-disco.stl', filename: 'arma-disco.stl' },
    ],
    thumbnail: 'miniaturas/FC-03.webp',
    specs: {
      'Arma': 'Disco Ø140 × 6 mm com 2 dentes',
      'Motor da arma': 'A2212 (1000–1400 KV) vertical na baía',
      'Fixação': '4× M3 (padrão 16/19 mm) + adaptador M6 do motor',
      'Impacto': '2× parafusos M4 nos dentes',
      'Tampa': 'Usar tampa com furo Ø14 (Ventilada ou Nervurada)',
    },
  },
  {
    id: 'FC-04',
    category: 'frame',
    name: 'Frame Central — Tambor',
    standard: STANDARD_ID,
    model: 'modelos/FC-04.glb',
    stl: 'stl/FC-04/frame-central.stl',
    extraStl: [
      { label: 'Arma — tambor', file: 'stl/FC-04/arma-tambor.stl', filename: 'arma-tambor.stl' },
      { label: 'Arma — tampa do tambor', file: 'stl/FC-04/arma-tambor-tampa.stl', filename: 'arma-tambor-tampa.stl' },
    ],
    thumbnail: 'miniaturas/FC-04.webp',
    specs: {
      'Arma': 'Tambor Ø44 × 43 mm, motor dentro do tambor',
      'Motor da arma': 'A2212 (1000–1400 KV) no braço esquerdo',
      'Rolamento': '625ZZ (5×16×5) no braço direito',
      'Eixo': 'Parafuso M5 na tampa do tambor',
      'Fixação': '4× M3 (padrão 16/19 mm) + adaptador M6',
    },
  },
  {
    id: 'FC-05',
    category: 'frame',
    name: 'Frame Central — Martelo',
    standard: STANDARD_ID,
    model: 'modelos/FC-05.glb',
    stl: 'stl/FC-05/frame-central.stl',
    thumbnail: 'miniaturas/FC-05.webp',
    specs: {
      'Arma': 'Cunha frontal de 24 mm para segurar o oponente sob o martelo',
      'Uso': 'Combinar com a Tampa — Martelo',
    },
  },
  {
    id: 'TP-01',
    category: 'tampa',
    name: 'Tampa — Original',
    standard: STANDARD_ID,
    model: 'modelos/TP-01.glb',
    stl: 'stl/TP-01/tampa.stl',
    thumbnail: 'miniaturas/TP-01.webp',
    specs: {
      'Origem': 'Projeto Robo 02 (Fusion)',
      'Furo da arma': 'Ø8,5',
    },
  },
  {
    id: 'TP-02',
    category: 'tampa',
    name: 'Tampa — Ventilada',
    standard: STANDARD_ID,
    model: 'modelos/TP-02.glb',
    stl: 'stl/TP-02/tampa.stl',
    thumbnail: 'miniaturas/TP-02.webp',
    specs: {
      'Detalhe': '21 rasgos de ventilação',
      'Furo da arma': 'Ø14 (passa o adaptador M6 do A2212)',
    },
  },
  {
    id: 'TP-03',
    category: 'tampa',
    name: 'Tampa — Nervurada',
    standard: STANDARD_ID,
    model: 'modelos/TP-03.glb',
    stl: 'stl/TP-03/tampa.stl',
    thumbnail: 'miniaturas/TP-03.webp',
    specs: {
      'Detalhe': 'Chevrons gravados 1,2 mm',
      'Furo da arma': 'Ø14 (passa o adaptador M6 do A2212)',
    },
  },
  {
    id: 'TP-04',
    category: 'tampa',
    name: 'Tampa — Martelo',
    standard: STANDARD_ID,
    model: 'modelos/TP-04.glb',
    stl: 'stl/TP-04/tampa.stl',
    extraStl: [
      { label: 'Arma — martelo', file: 'stl/TP-04/arma-martelo.stl', filename: 'arma-martelo.stl' },
    ],
    thumbnail: 'miniaturas/TP-04.webp',
    specs: {
      'Arma': 'Martelo de 100 mm acionado por servo',
      'Servo': 'MG996R (metal, ~10 kg·cm)',
      'Eixo': 'Horn redondo do servo + parafuso M3 no lado oposto',
      'Impacto': 'Parafuso M5 na cabeça',
      'Impressão': 'Imprimir em pé com suporte sob a tampa',
    },
  },
];

/** Combinação carregada em “Nova montagem” e “Restaurar montagem padrão”. */
export const DEFAULT_COMBINATION: Combination = {
  lateral1: 'L1-01',
  lateral2: 'L2-01',
  frame: 'FC-01',
  tampa: 'TP-01',
};

/* -------------------------------------------------------------- consultas */

const byId = new Map(MODULES.map((m) => [m.id, m]));

export const getModule = (id: string | undefined) => (id ? byId.get(id) : undefined);

export const modulesOf = (category: ModuleCategory) =>
  MODULES.filter((m) => m.category === category);

/** Garante que uma combinação só aponte para peças existentes. */
export function sanitizeCombination(input: Partial<Combination> | undefined): Combination {
  const out = { ...DEFAULT_COMBINATION };
  (Object.keys(out) as ModuleCategory[]).forEach((cat) => {
    const wanted = getModule(input?.[cat]);
    const fallback = getModule(DEFAULT_COMBINATION[cat]) ?? modulesOf(cat)[0];
    const pick = wanted && wanted.category === cat ? wanted : fallback;
    out[cat] = pick?.id ?? '';
  });
  return out;
}
