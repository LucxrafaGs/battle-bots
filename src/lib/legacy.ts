import type { LegacyEdition } from '@/types/content';

/** Resumo do conteúdo cadastrado em uma edição (sem inventar nada). */
export function editionSummary(e: LegacyEdition) {
  const photos = e.photos?.filter((m) => m.kind === 'image').length ?? 0;
  const videos = (e.photos?.filter((m) => m.kind === 'video').length ?? 0) + (e.videos?.length ?? 0) + (e.mainVideo ? 1 : 0);
  const parts: string[] = [];
  if (photos) parts.push(`${photos} ${photos === 1 ? 'foto' : 'fotos'}`);
  if (videos) parts.push(`${videos} ${videos === 1 ? 'vídeo' : 'vídeos'}`);
  if (e.teams?.length) parts.push(`${e.teams.length} ${e.teams.length === 1 ? 'equipe' : 'equipes'}`);
  return parts.length ? parts.join(', ') : 'Arquivo vazio';
}

export function isEditionEmpty(e: LegacyEdition) {
  return !(
    e.title ||
    e.date ||
    e.location ||
    e.description?.length ||
    e.cover ||
    e.mainVideo ||
    e.videos?.length ||
    e.photos?.length ||
    e.teams?.length ||
    e.robots?.length ||
    e.results?.length ||
    e.highlights?.length ||
    e.technical?.length
  );
}
