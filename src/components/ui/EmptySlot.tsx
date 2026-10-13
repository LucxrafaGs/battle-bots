import type { CSSProperties } from 'react';

/* ==========================================================================
   Espaço reservado para conteúdo real ainda não cadastrado.
   Hachura de corte (como em desenho técnico), nome do campo e onde
   preenchê-lo. Nunca exibe conteúdo inventado.
   ========================================================================== */
export default function EmptySlot({
  label,
  hint,
  ratio,
  compact,
  className = '',
  style,
}: {
  label: string;
  hint?: string;
  ratio?: string;
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`empty ${compact ? 'empty--compact' : ''} ${className}`}
      style={{ aspectRatio: ratio, ...style }}
    >
      <span className="empty-label">{label}</span>
      {hint && <span className="empty-hint">{hint}</span>}
    </div>
  );
}
