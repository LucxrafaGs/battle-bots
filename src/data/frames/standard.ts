import type { ModuleCategory, Vec3 } from '@/types/content';

/* ==========================================================================
   PADRÃO MODULAR BB-1 — base “Robo 02”
   --------------------------------------------------------------------------
   Todas as peças são exportadas JÁ POSICIONADAS no sistema de coordenadas do
   robô (milímetros):
     • Origem: centro do Frame Central, na face inferior (base).
     • +Y: para cima      • +Z: frente do robô (baía da arma)
     • Lateral 1 fica em −X e Lateral 2 em +X.
     • Chão: Y = −4 (rodas Ø44 com eixo em Y = 18).

   Como cada arquivo já está no lugar certo, o ponto de encaixe de todas as
   categorias é a origem. Qualquer Lateral 1 + Lateral 2 + Frame + Tampa se
   combina sem ajuste manual. Os detalhes de exportação estão em
   docs/PADRAO-MODULAR.md.
   ========================================================================== */

export const STANDARD_ID = 'BB-1';

/** Envelope do Frame Central original (mm). */
export const FRAME_ENVELOPE = { width: 170, length: 199, height: 36 } as const;

/** Altura do chão (mm) — as rodas tocam este plano. */
export const GROUND_Y = -4;

export interface Socket {
  position: Vec3;
  /** Direção da vista explodida e da animação “Ver montagem”. */
  explode: Vec3;
  /** Distância de afastamento na vista explodida (mm). */
  distance: number;
  /** Trilho por onde a peça sai e entra quando é trocada. */
  swap: Vec3;
  /** Comprimento do trilho de troca (mm). */
  swapDistance: number;
}

const ORIGIN = { x: 0, y: 0, z: 0 };

export const SOCKETS: Record<ModuleCategory, Socket> = {
  frame: {
    position: ORIGIN,
    explode: { x: 0, y: -0.3, z: 0 },
    distance: 40,
    swap: { x: 0, y: 0, z: -1 },
    swapDistance: 320,
  },
  lateral1: {
    position: ORIGIN,
    explode: { x: -1, y: 0, z: 0 },
    distance: 110,
    swap: { x: -1, y: 0, z: 0 },
    swapDistance: 200,
  },
  lateral2: {
    position: ORIGIN,
    explode: { x: 1, y: 0, z: 0 },
    distance: 110,
    swap: { x: 1, y: 0, z: 0 },
    swapDistance: 200,
  },
  tampa: {
    position: ORIGIN,
    explode: { x: 0, y: 1, z: 0 },
    distance: 110,
    swap: { x: 0, y: 1, z: 0 },
    swapDistance: 180,
  },
};

/** Ordem em que o robô é montado na animação “Ver montagem”. */
export const ASSEMBLY_ORDER: ModuleCategory[] = ['frame', 'lateral1', 'lateral2', 'tampa'];

/** Ordem de exibição das categorias na interface. */
export const CATEGORY_ORDER: ModuleCategory[] = ['lateral1', 'lateral2', 'frame', 'tampa'];

export const CATEGORY_LABEL: Record<ModuleCategory, string> = {
  lateral1: 'Lateral 1',
  lateral2: 'Lateral 2',
  frame: 'Frame Central',
  tampa: 'Tampa',
};

/** Nome do arquivo STL de cada categoria dentro do ZIP exportado. */
export const EXPORT_FILENAME: Record<ModuleCategory, string> = {
  frame: 'frame-central.stl',
  lateral1: 'lateral-1.stl',
  lateral2: 'lateral-2.stl',
  tampa: 'tampa.stl',
};

/** Pasta de cada categoria dentro do ZIP (peças extras, como armas). */
export const EXPORT_FOLDER: Record<ModuleCategory, string> = {
  frame: 'frame-central',
  lateral1: 'lateral-1',
  lateral2: 'lateral-2',
  tampa: 'tampa',
};

/** Escala da cena 3D: 1 unidade = 1/0,006 mm (robô de ~30 cm ≈ 1,8 unidade). */
export const SCENE_SCALE = 0.006;
