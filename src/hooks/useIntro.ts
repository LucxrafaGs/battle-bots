import { useEffect, useRef } from 'react';
import { useUi } from '@/store/ui';

/**
 * Executa a animação de entrada de uma página somente quando ela está
 * visível (após o loading e após a máscara de transição abrir).
 * O callback pode devolver uma função de limpeza.
 */
export function useIntro(fn: () => void | (() => void)) {
  const booted = useUi((s) => s.booted);
  const covered = useUi((s) => s.covered);
  const ran = useRef(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!booted || covered || ran.current) return;
    ran.current = true;
    const cleanup = fnRef.current();
    return typeof cleanup === 'function' ? cleanup : undefined;
  }, [booted, covered]);
}
