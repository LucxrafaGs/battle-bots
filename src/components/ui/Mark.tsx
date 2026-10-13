/* Símbolo Battle Bots: os quatro módulos do robô vistos de cima —
   Lateral 1, Frame Central, Lateral 2 e a Tampa. */
export default function Mark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={`mark ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect className="mark-l1" x="3" y="8" width="6" height="16" fill="currentColor" />
      <rect className="mark-fc" x="11" y="11" width="10" height="13" fill="#EF3535" />
      <rect className="mark-l2" x="23" y="8" width="6" height="16" fill="currentColor" />
      <rect className="mark-tp" x="11" y="7" width="10" height="2.5" fill="#FF642F" />
    </svg>
  );
}
