/* ==========================================================================
   Carregamento inicial com progresso REAL.
   Cada tarefa representa um recurso essencial; o progresso é a soma dos
   pesos concluídos. Nada é simulado: se tudo já estiver em cache, o
   contador chega a 100 quase imediatamente.
   ========================================================================== */

export interface BootTask {
  label: string;
  weight: number;
  run: () => Promise<unknown>;
}

const waitWindowLoad = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', () => resolve(), { once: true });
  });

const loadFont = (descriptor: string) =>
  document.fonts
    ? document.fonts.load(descriptor).then(() => undefined).catch(() => undefined)
    : Promise.resolve();

export const BOOT_TASKS: BootTask[] = [
  { label: 'Documento', weight: 1, run: waitWindowLoad },
  { label: 'Tipografia display', weight: 1, run: () => loadFont('800 120px "Archivo Variable"') },
  { label: 'Tipografia de texto', weight: 1, run: () => loadFont('400 16px "Instrument Sans Variable"') },
  { label: 'Interface', weight: 2, run: () => import('@/pages/Home') },
  { label: 'Motor 3D', weight: 4, run: () => import('@/three/RobotAssembly') },
  { label: 'Montador', weight: 2, run: () => import('@/pages/Builder') },
];

/**
 * Executa as tarefas em paralelo e informa o progresso (0..1).
 * Uma falha não trava o site: a tarefa conta como concluída e o erro é
 * registrado no console.
 */
export function runBoot(onProgress: (p: number, label: string) => void): Promise<void> {
  const total = BOOT_TASKS.reduce((s, t) => s + t.weight, 0);
  let done = 0;
  onProgress(0, '');
  return Promise.all(
    BOOT_TASKS.map((task) =>
      task
        .run()
        .catch((err) => console.error(`[boot] ${task.label}`, err))
        .then(() => {
          done += task.weight;
          onProgress(done / total, task.label);
        }),
    ),
  ).then(() => undefined);
}
