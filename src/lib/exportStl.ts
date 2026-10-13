import type { Combination, ModuleCategory, ModuleDefinition } from '@/types/content';
import { getModule, sanitizeCombination } from '@/data/frames/catalog';
import { CATEGORY_LABEL, CATEGORY_ORDER, EXPORT_FILENAME, EXPORT_FOLDER, STANDARD_ID } from '@/data/frames/standard';
import { SITE } from '@/data/site';
import { asset, PREVIEW } from './motion';

/* ==========================================================================
   Exportação STL
   Busca os arquivos STL ORIGINAIS cadastrados no catálogo e os empacota
   em um ZIP. Nenhuma geometria é convertida ou gerada aqui: se um STL
   estiver ausente, a exportação é bloqueada e o motivo é informado.
   ========================================================================== */

export type StlStatus = 'checking' | 'ok' | 'missing' | 'placeholder' | 'not-registered';

export interface StlCheck {
  category: ModuleCategory;
  module?: ModuleDefinition;
  status: StlStatus;
  detail?: string;
}

const looksLikeHtml = (res: Response) => (res.headers.get('content-type') ?? '').includes('text/html');

export async function checkStl(category: ModuleCategory, id: string): Promise<StlCheck> {
  const module = getModule(id);
  if (!module) return { category, status: 'not-registered', detail: `Módulo ${id} não está no catálogo.` };
  if (!module.stl) {
    return { category, module, status: 'not-registered', detail: 'Nenhum arquivo STL cadastrado para esta peça.' };
  }
  if (PREVIEW) return { category, module, status: 'ok', detail: module.stl };
  const files = [module.stl, ...(module.extraStl ?? []).map((e) => e.file)];
  for (const file of files) {
    try {
      let res = await fetch(asset(file), { method: 'HEAD', cache: 'no-store' });
      if (res.status === 405 || res.status === 501) res = await fetch(asset(file), { cache: 'no-store' });
      if (!res.ok || looksLikeHtml(res)) {
        return { category, module, status: 'missing', detail: `Arquivo não encontrado: ${file}` };
      }
    } catch {
      return { category, module, status: 'missing', detail: `Não foi possível acessar ${file}` };
    }
  }
  return { category, module, status: 'ok', detail: module.stl };
}

export const checkAll = (combo: Combination) =>
  Promise.all(CATEGORY_ORDER.map((cat) => checkStl(cat, combo[cat])));

/** Confere se o conteúdo é um STL (binário ou ASCII). */
function validateStl(buf: ArrayBuffer, path: string) {
  if (buf.byteLength >= 84) {
    const view = new DataView(buf);
    const triangles = view.getUint32(80, true);
    if (84 + triangles * 50 === buf.byteLength) return;
  }
  const head = new TextDecoder().decode(buf.slice(0, 256)).trimStart().toLowerCase();
  if (head.startsWith('solid') && head.includes('facet')) return;
  if (head.startsWith('solid') && buf.byteLength < 256) return;
  throw new Error(`O arquivo ${path} não parece ser um STL válido.`);
}

export interface ExportConfig {
  projeto: string;
  padrao: string;
  geradoEm: string;
  combinacao: Combination;
  modulos: Record<ModuleCategory, { id: string; nome: string; arquivo: string; origem: string; extras: string[] }>;
}

export function buildConfig(combo: Combination): ExportConfig {
  const modulos = {} as ExportConfig['modulos'];
  CATEGORY_ORDER.forEach((cat) => {
    const m = getModule(combo[cat]);
    modulos[cat] = {
      id: combo[cat],
      nome: m?.name ?? combo[cat],
      arquivo: EXPORT_FILENAME[cat],
      origem: m?.stl ?? '',
      extras: (m?.extraStl ?? []).map((e) => `${EXPORT_FOLDER[cat]}/${e.filename}`),
    };
  });
  return {
    projeto: 'Battle Bots',
    padrao: STANDARD_ID,
    geradoEm: new Date().toISOString(),
    combinacao: { ...combo },
    modulos,
  };
}

function extrasText(config: ExportConfig) {
  const list = CATEGORY_ORDER.flatMap((cat) =>
    config.modulos[cat].extras.map((e) => `- \`${e}\` (acompanha ${config.modulos[cat].nome})`),
  );
  return list.length ? `\nPeças adicionais (armas e acessórios):\n\n${list.join('\n')}\n` : '';
}

function readme(config: ExportConfig) {
  const rows = CATEGORY_ORDER.map(
    (cat) =>
      `| ${CATEGORY_LABEL[cat]} | ${config.modulos[cat].nome} | ${config.modulos[cat].id} | ${config.modulos[cat].arquivo} |`,
  ).join('\n');
  const date = new Date(config.geradoEm).toLocaleString('pt-BR');
  return `# ${SITE.brand}

${SITE.signature}

Combinação exportada em ${date} — padrão modular ${config.padrao}.

| Categoria | Módulo | Identificador | Arquivo |
| --- | --- | --- | --- |
${rows}
${extrasText(config)}
Os arquivos STL deste pacote são os originais cadastrados na biblioteca,
sem conversão, e mantêm as dimensões de projeto para impressão 3D.

Para recuperar esta combinação no montador, use “Carregar combinação”
e importe o arquivo \`configuracao.json\`.
`;
}

/** Monta o ZIP. Lança erro se algum STL estiver ausente ou inválido. */
export async function buildZip(combo: Combination): Promise<{ blob: Blob; filename: string }> {
  const checks = await checkAll(combo);
  const missing = checks.filter((c) => c.status !== 'ok');
  if (missing.length) {
    throw new Error(
      `Exportação incompleta bloqueada. Faltam: ${missing.map((m) => CATEGORY_LABEL[m.category]).join(', ')}.`,
    );
  }
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const folder = zip.folder('BATTLE-BOTS')!;
  const fetchStl = async (path: string) => {
    const res = await fetch(asset(path), { cache: 'no-store' });
    if (!res.ok || looksLikeHtml(res)) throw new Error(`Falha ao baixar ${path}.`);
    const buf = await res.arrayBuffer();
    validateStl(buf, path);
    return buf;
  };
  await Promise.all(
    checks.flatMap((c) => [
      fetchStl(c.module!.stl!).then((buf) => folder.file(EXPORT_FILENAME[c.category], buf, { binary: true })),
      ...(c.module!.extraStl ?? []).map((e) =>
        fetchStl(e.file).then((buf) => folder.file(`${EXPORT_FOLDER[c.category]}/${e.filename}`, buf, { binary: true })),
      ),
    ]),
  );
  const config = buildConfig(combo);
  folder.file('configuracao.json', JSON.stringify(config, null, 2));
  folder.file('LEIA-ME.md', readme(config));
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const ids = CATEGORY_ORDER.map((c) => combo[c]).join('_');
  return { blob, filename: `BATTLE-BOTS_${ids}.zip` };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Lê um configuracao.json (ou uma combinação simples) e devolve a combinação. */
export function parseConfig(text: string): Combination {
  const data = JSON.parse(text) as Partial<ExportConfig> & Partial<Combination>;
  const raw: Partial<Combination> =
    data.combinacao ??
    (data.modulos
      ? (Object.fromEntries(
          Object.entries(data.modulos).map(([k, v]) => [k, (v as { id: string }).id]),
        ) as Partial<Combination>)
      : data);
  const known = CATEGORY_ORDER.filter((c) => typeof raw[c] === 'string' && getModule(raw[c]));
  if (!known.length) throw new Error('O arquivo não contém módulos conhecidos por este catálogo.');
  return sanitizeCombination(raw);
}
