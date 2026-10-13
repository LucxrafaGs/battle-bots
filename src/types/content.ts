/* ==========================================================================
   BATTLE BOTS — tipos de conteúdo
   Todo conteúdo do site é descrito por estes tipos. Os dados ficam em
   src/data/** e os arquivos (modelos, STL, mídia) em public/**.
   ========================================================================== */

/** Caminho relativo à pasta public/ (ex.: "modelos/frame-01.glb"). */
export type PublicPath = string;

/* ---------------------------------------------------------------- Mídia */

export type MediaKind = 'image' | 'video' | 'youtube' | 'pdf' | 'model';

export interface MediaItem {
  kind: MediaKind;
  /** Arquivo em public/ ou URL completa (YouTube, Vimeo etc.). */
  src: string;
  /** Texto alternativo / legenda. */
  caption?: string;
  /** Imagem de capa para vídeos. */
  poster?: PublicPath;
  /** Proporção opcional, ex.: "16/9", "4/5". */
  ratio?: string;
}

export interface DownloadItem {
  label: string;
  file: PublicPath;
}

/* ------------------------------------------------------- Montador modular */

export type ModuleCategory = 'lateral1' | 'lateral2' | 'frame' | 'tampa';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Peça cadastrada no catálogo do montador.
 * A peça só entra no catálogo principal se respeitar o padrão modular
 * (ver src/data/frames/standard.ts e docs/PADRAO-MODULAR.md).
 */
export interface ModuleDefinition {
  /** Identificador único e estável, ex.: "FC-02". */
  id: string;
  category: ModuleCategory;
  /** Nome exibido, ex.: "Frame Central — Modelo 02". */
  name: string;
  /** Versão do padrão modular que a peça cumpre, ex.: "BB-1". */
  standard: string;
  /** Arquivo de visualização 3D otimizado (GLB/GLTF). Opcional. */
  model?: PublicPath;
  /** Arquivo STL original para impressão 3D. */
  stl?: PublicPath;
  /**
   * Peças adicionais que acompanham o módulo (ex.: a arma de um frame).
   * Entram no ZIP dentro da pasta da categoria.
   */
  extraStl?: { label: string; file: PublicPath; filename: string }[];
  /** Miniatura (PNG/JPG/WebP). Se ausente, é gerada a partir do modelo. */
  thumbnail?: PublicPath;
  /**
   * Correção entre a origem do arquivo e o ponto de encaixe do padrão.
   * Em milímetros e graus. Use quando o arquivo não foi exportado
   * exatamente na origem definida pelo padrão.
   */
  offset?: { position?: Partial<Vec3>; rotation?: Partial<Vec3> };
  /** Escala do arquivo de visualização para milímetros (padrão 1). */
  unitScale?: number;
  /** Dados técnicos opcionais (chave → valor). */
  specs?: Record<string, string>;
}

export interface RobotPreset {
  id: string;
  name: string;
  /** Descrição curta da arma / proposta. */
  summary?: string;
  modules: Combination;
}

/** Aviso de interferência real entre dois módulos (calculado no CAD). */
export interface CompatNote {
  a: string;
  b: string;
  reason: string;
}

export interface Combination {
  lateral1: string;
  lateral2: string;
  frame: string;
  tampa: string;
}

export interface SavedCombination {
  id: string;
  name: string;
  createdAt: string;
  modules: Combination;
}

/* ------------------------------------------------------------- Construção */

export interface GuideStep {
  id: string;
  title: string;
  /** Parágrafos de instrução. Vazio até receber conteúdo real. */
  body?: string[];
  media?: MediaItem[];
  /** Itens de verificação / observações. */
  notes?: string[];
}

export type DiagramViewKind =
  | 'esquematico'
  | 'ligacao'
  | 'foto'
  | 'passo-a-passo'
  | 'blocos'
  | 'tabela'
  | 'original';

export interface DiagramView {
  kind: DiagramViewKind;
  /** Rótulo opcional (sobrescreve o padrão do tipo). */
  label?: string;
  file: PublicPath;
  format: 'svg' | 'png' | 'jpg' | 'webp' | 'pdf';
}

/** Ligação (rede elétrica) destacável nas vistas SVG via atributo data-net. */
export interface DiagramNet {
  id: string;
  label: string;
  color: string;
  detail?: string;
}

export interface DiagramNote {
  level: 'atencao' | 'dica';
  text: string;
}

export interface BomItem {
  item: string;
  qty: string;
  note?: string;
}

export interface Diagram {
  id: string;
  name: string;
  /** Grupo / variação da montagem elétrica. */
  group: string;
  description?: string;
  views: DiagramView[];
  /** Informações técnicas (chave → valor). */
  info?: Record<string, string>;
  downloads?: DownloadItem[];
  /** Ligações destacáveis (cores e descrições). */
  nets?: DiagramNet[];
  /** Avisos e dicas exibidos na lateral. */
  notes?: DiagramNote[];
  /** Lista de material. */
  bom?: BomItem[];
  /** Material de exemplo — remover ao cadastrar diagramas reais. */
  example?: boolean;
}

export interface CodeSection {
  title: string;
  /** Linhas (1-based, inclusivas) do trecho explicado. */
  lines: [number, number];
  text: string;
}

export interface CodeEntry {
  id: string;
  name: string;
  description?: string;
  board?: string;
  /** Linguagem para destaque de sintaxe: "cpp", "c", "python", "javascript". */
  language: string;
  /** Arquivo-fonte em public/. Se ausente, o código ainda não foi cadastrado. */
  source?: PublicPath;
  /** Nome sugerido para download (ex.: "robo-01.ino"). */
  filename?: string;
  sections?: CodeSection[];
  instructions?: string[];
  downloads?: DownloadItem[];
  /** Arquivo demonstrativo — remover ao cadastrar o código real. */
  example?: boolean;
}

/* ----------------------------------------------------------------- Legado */

export interface Team {
  name: string;
  members?: string[];
  robot?: string;
}

export interface RobotEntry {
  name: string;
  team?: string;
  image?: PublicPath;
  notes?: string;
}

export interface ResultEntry {
  position?: string;
  label: string;
  detail?: string;
}

export interface LegacyEdition {
  /** Ano, usado também na URL (/legado/2023). */
  year: string;
  title?: string;
  date?: string;
  location?: string;
  description?: string[];
  cover?: PublicPath;
  mainVideo?: MediaItem;
  videos?: MediaItem[];
  photos?: MediaItem[];
  teams?: Team[];
  robots?: RobotEntry[];
  results?: ResultEntry[];
  highlights?: string[];
  technical?: string[];
}

/* ------------------------------------------------------------------ Sobre */

export interface AboutContent {
  brand: string;
  signature: string;
  photo?: PublicPath;
  name?: string;
  biography?: string[];
  origin?: string[];
  personal?: string[];
  message?: string[];
  /** Assinatura ao final da mensagem. */
  messageSignoff?: string[];
  memories?: MediaItem[];
  thanks?: string[];
}
