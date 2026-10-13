import { useEffect, useState } from 'react';
import type { ModuleDefinition } from '@/types/content';
import { asset } from '@/lib/motion';

/* Cartão compacto de variação: miniatura, nome, identificador e estado. */
export default function ModuleCard({
  module,
  selected,
  onSelect,
}: {
  module: ModuleDefinition;
  selected: boolean;
  onSelect: () => void;
}) {
  const [thumb, setThumb] = useState<string | null>(module.thumbnail ? asset(module.thumbnail) : null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (module.thumbnail) return;
    let alive = true;
    import('@/three/thumbnails')
      .then(({ getThumbnail }) => getThumbnail(module))
      .then((url) => alive && setThumb(url))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [module]);

  return (
    <button
      type="button"
      className={`mcard ${selected ? 'is-selected' : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="mcard-thumb">
        {thumb ? (
          <img src={thumb} alt="" draggable={false} />
        ) : (
          <span className="mcard-thumb-empty">{failed ? 'Sem prévia' : ''}</span>
        )}
      </span>
      <span className="mcard-meta">
        <span className="mcard-name">{module.name}</span>
        <span className="mcard-id">{module.id}</span>
      </span>
      <span className="mcard-state" aria-hidden="true">
        {selected ? 'Selecionada' : 'Selecionar'}
      </span>
    </button>
  );
}
