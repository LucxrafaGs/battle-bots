/* Texto que rola para cima no hover (duas cópias empilhadas). */
export default function RollText({ children }: { children: string }) {
  return (
    <span className="roll" aria-label={children}>
      <span className="roll-track" aria-hidden="true">
        <span className="roll-line">{children}</span>
        <span className="roll-line">{children}</span>
      </span>
    </span>
  );
}
