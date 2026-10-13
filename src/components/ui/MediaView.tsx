import { lazy, Suspense, useState } from 'react';
import type { MediaItem } from '@/types/content';
import { asset } from '@/lib/motion';

const ModelViewer = lazy(() => import('@/three/ModelViewer'));

export function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m?.[1] ?? null;
}

/* Renderiza um item de mídia cadastrado: imagem, vídeo, YouTube, PDF ou modelo 3D. */
export default function MediaView({
  item,
  className = '',
  fit = 'cover',
  controls = true,
}: {
  item: MediaItem;
  className?: string;
  fit?: 'cover' | 'contain';
  controls?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const style = item.ratio ? { aspectRatio: item.ratio } : undefined;

  if (item.kind === 'image') {
    return (
      <div className={`media media--image ${loaded ? 'is-loaded' : ''} ${className}`} style={style}>
        <img
          src={asset(item.src)}
          alt={item.caption ?? ''}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          style={{ objectFit: fit }}
          draggable={false}
        />
      </div>
    );
  }
  if (item.kind === 'video') {
    return (
      <div className={`media media--video ${className}`} style={style}>
        <video
          src={asset(item.src)}
          poster={item.poster ? asset(item.poster) : undefined}
          controls={controls}
          preload="metadata"
          playsInline
        >
          {item.caption}
        </video>
      </div>
    );
  }
  if (item.kind === 'youtube') {
    const id = youtubeId(item.src);
    return (
      <div className={`media media--embed ${className}`} style={{ aspectRatio: item.ratio ?? '16/9' }}>
        {id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={item.caption ?? 'Vídeo'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <a href={item.src} target="_blank" rel="noreferrer">
            Abrir vídeo
          </a>
        )}
      </div>
    );
  }
  if (item.kind === 'pdf') {
    return (
      <div className={`media media--pdf ${className}`} style={{ aspectRatio: item.ratio ?? '4/5' }}>
        <iframe src={asset(item.src)} title={item.caption ?? 'Documento PDF'} />
      </div>
    );
  }
  return (
    <div className={`media media--model ${className}`} style={{ aspectRatio: item.ratio ?? '4/3' }}>
      <Suspense fallback={null}>
        <ModelViewer src={item.src} />
      </Suspense>
    </div>
  );
}
