import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import type { Combination, ModuleCategory } from '@/types/content';
import { getModule } from '@/data/frames/catalog';
import { ASSEMBLY_ORDER, CATEGORY_ORDER, SCENE_SCALE, SOCKETS } from '@/data/frames/standard';
import { clamp01, easeInCubic, easeInOutCubic, easeOutExpo, reducedMotion } from '@/lib/motion';
import { disposeObject, loadModuleObject } from './moduleLoader';

/* ==========================================================================
   Robô montado a partir de uma combinação de quatro módulos.
   Cada categoria ocupa um "slot" fixo (socket do padrão BB-1). Ao trocar a
   peça de um slot, a anterior sai pelo trilho de troca e a nova entra e
   encaixa. A câmera não é tocada aqui.
   ========================================================================== */

export interface RobotAssemblyProps {
  combination: Combination;
  exploded?: boolean;
  /** Incrementar para tocar a animação “Ver montagem”. */
  assemblyTick?: number;
  /** Toca a montagem completa assim que o componente aparece. */
  assembleOnMount?: boolean;
  highlight?: ModuleCategory | null;
  interactive?: boolean;
  onHover?: (c: ModuleCategory | null) => void;
  onPick?: (c: ModuleCategory) => void;
  onLoadError?: (moduleId: string, err: unknown) => void;
  /** Avisado quando todos os slots têm uma peça carregada. */
  onReady?: () => void;
}

const ORANGE = new THREE.Color('#ff642f');

const ENTER_MS = 950;
const LEAVE_MS = 520;
const ENTER_DELAY_MS = 180;

const ASSEMBLY = { separate: 0.75, hold: 0.25, step: 0.42, join: 0.9 };

interface Instance {
  key: number;
  moduleId: string;
  obj: THREE.Object3D | null;
  state: 'loading' | 'entering' | 'idle' | 'leaving';
  startedAt: number;
  flash: number;
}

let instanceKey = 0;
const now = () => performance.now();

type Mat = THREE.MeshStandardMaterial;

function forEachMaterial(obj: THREE.Object3D, fn: (m: Mat) => void) {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((m) => fn(m as Mat));
  });
}

function setOpacity(obj: THREE.Object3D, opacity: number) {
  const fading = opacity < 0.999;
  forEachMaterial(obj, (m) => {
    if (m.transparent !== fading) {
      m.transparent = fading;
      m.needsUpdate = true;
    }
    m.opacity = opacity;
    m.depthWrite = !fading || opacity > 0.6;
  });
}

function setGlow(obj: THREE.Object3D, amount: number) {
  forEachMaterial(obj, (m) => {
    if (!m.emissive) return;
    if (!m.userData.baseEmissive) m.userData.baseEmissive = m.emissive.clone();
    m.emissive.copy(m.userData.baseEmissive as THREE.Color).lerp(ORANGE, Math.min(1, amount));
  });
}

interface SlotProps {
  category: ModuleCategory;
  moduleId: string;
  exploded: boolean;
  assemblyStart: React.RefObject<number | null>;
  highlighted: boolean;
  interactive: boolean;
  onHover?: (c: ModuleCategory | null) => void;
  onPick?: (c: ModuleCategory) => void;
  onLoadError?: (id: string, err: unknown) => void;
  onLoaded: (c: ModuleCategory) => void;
}

function ModuleSlot({
  category,
  moduleId,
  exploded,
  assemblyStart,
  highlighted,
  interactive,
  onHover,
  onPick,
  onLoadError,
  onLoaded,
}: SlotProps) {
  const socket = SOCKETS[category];
  const [instances, setInstances] = useState<Instance[]>([]);
  const list = useRef<Instance[]>([]);
  const explodeAmt = useRef(exploded ? 1 : 0);
  const glow = useRef(0);
  const reduced = useRef(reducedMotion());
  const groups = useRef(new Map<number, THREE.Group>());

  const sync = () => setInstances([...list.current]);

  // Troca de peça
  useEffect(() => {
    const def = getModule(moduleId);
    let cancelled = false;
    list.current.forEach((inst) => {
      if (inst.state !== 'leaving') {
        inst.state = 'leaving';
        inst.startedAt = now();
      }
    });
    if (!def) {
      sync();
      return;
    }
    const inst: Instance = {
      key: ++instanceKey,
      moduleId,
      obj: null,
      state: 'loading',
      startedAt: now(),
      flash: 0,
    };
    list.current.push(inst);
    sync();
    const isFirst = list.current.length === 1;
    loadModuleObject(def)
      .then((obj) => {
        if (cancelled || inst.state === 'leaving') {
          disposeObject(obj);
          return;
        }
        inst.obj = obj;
        inst.state = isFirst ? 'idle' : 'entering';
        inst.startedAt = now() + (isFirst ? 0 : ENTER_DELAY_MS);
        if (inst.state === 'idle') setOpacity(obj, 1);
        else setOpacity(obj, 0);
        sync();
        onLoaded(category);
      })
      .catch((err) => {
        list.current = list.current.filter((i) => i !== inst);
        sync();
        onLoadError?.(moduleId, err);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  // Limpeza final
  useEffect(
    () => () => {
      list.current.forEach((i) => i.obj && disposeObject(i.obj));
      list.current = [];
    },
    [],
  );

  useFrame((_, dt) => {
    const t = now();
    const reduce = reduced.current;
    const target = exploded ? 1 : 0;
    explodeAmt.current = reduce
      ? target
      : explodeAmt.current + (target - explodeAmt.current) * (1 - Math.exp(-6 * dt));
    glow.current += ((highlighted ? 1 : 0) - glow.current) * (1 - Math.exp(-10 * dt));

    // Animação "Ver montagem"
    let assembly = 0;
    if (assemblyStart.current != null && !reduce) {
      const s = (t - assemblyStart.current) / 1000;
      const idx = ASSEMBLY_ORDER.indexOf(category);
      const sep = easeInOutCubic(clamp01(s / ASSEMBLY.separate));
      const joinStart = ASSEMBLY.separate + ASSEMBLY.hold + idx * ASSEMBLY.step;
      const join = easeOutExpo(clamp01((s - joinStart) / ASSEMBLY.join));
      assembly = sep * (1 - join) * 1.9;
    }

    let removed = false;
    for (const inst of list.current) {
      const g = groups.current.get(inst.key);
      if (!g || !inst.obj) continue;
      let swap = 0;
      let opacity = 1;

      if (inst.state === 'entering') {
        const p = reduce ? 1 : clamp01((t - inst.startedAt) / ENTER_MS);
        const e = easeOutExpo(p);
        swap = (1 - e) * socket.swapDistance;
        opacity = clamp01(p * 3.2);
        if (p >= 1) {
          inst.state = 'idle';
          inst.flash = reduce ? 0 : 1;
        }
      } else if (inst.state === 'leaving') {
        const p = reduce ? 1 : clamp01((t - inst.startedAt) / LEAVE_MS);
        swap = easeInCubic(p) * socket.swapDistance;
        opacity = 1 - p;
        if (p >= 1) removed = true;
      }

      inst.flash = Math.max(0, inst.flash - dt * 1.8);
      const out = (explodeAmt.current + assembly) * socket.distance;
      g.position.set(
        (socket.position.x + socket.explode.x * out + socket.swap.x * swap) * SCENE_SCALE,
        (socket.position.y + socket.explode.y * out + socket.swap.y * swap) * SCENE_SCALE,
        (socket.position.z + socket.explode.z * out + socket.swap.z * swap) * SCENE_SCALE,
      );
      setOpacity(inst.obj, opacity);
      setGlow(inst.obj, glow.current * 0.012 + inst.flash * inst.flash * 0.3);
    }

    if (removed) {
      const keep: Instance[] = [];
      for (const inst of list.current) {
        const done =
          inst.state === 'leaving' &&
          (reduce || t - inst.startedAt >= LEAVE_MS);
        if (done) {
          if (inst.obj) disposeObject(inst.obj);
          groups.current.delete(inst.key);
        } else keep.push(inst);
      }
      list.current = keep;
      sync();
    }
  });

  const handlers = interactive
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover?.(category);
        },
        onPointerOut: () => onHover?.(null),
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onPick?.(category);
        },
      }
    : {};

  return (
    <group name={`slot-${category}`} {...handlers}>
      {instances.map((inst) =>
        inst.obj ? (
          <group
            key={inst.key}
            scale={SCENE_SCALE}
            ref={(g) => {
              if (g) groups.current.set(inst.key, g);
            }}
          >
            <primitive object={inst.obj} />
          </group>
        ) : null,
      )}
    </group>
  );
}

export default function RobotAssembly({
  combination,
  exploded = false,
  assemblyTick = 0,
  assembleOnMount = false,
  highlight = null,
  interactive = false,
  onHover,
  onPick,
  onLoadError,
  onReady,
}: RobotAssemblyProps) {
  // Na abertura, o robô já começa separado e se monta em sequência.
  const assemblyStart = useRef<number | null>(
    assembleOnMount && !reducedMotion() ? now() - ASSEMBLY.separate * 1000 : null,
  );
  const lastTick = useRef(assemblyTick);
  const loaded = useRef(new Set<ModuleCategory>());
  const readyFired = useRef(false);

  useEffect(() => {
    if (assemblyTick !== lastTick.current) {
      lastTick.current = assemblyTick;
      assemblyStart.current = now();
    }
  }, [assemblyTick]);

  // Encerra o relógio da montagem quando a sequência termina
  useFrame(() => {
    if (assemblyStart.current == null) return;
    const total =
      ASSEMBLY.separate + ASSEMBLY.hold + (ASSEMBLY_ORDER.length - 1) * ASSEMBLY.step + ASSEMBLY.join;
    if ((now() - assemblyStart.current) / 1000 > total + 0.1) assemblyStart.current = null;
  });

  const handleLoaded = (c: ModuleCategory) => {
    loaded.current.add(c);
    if (!readyFired.current && loaded.current.size === CATEGORY_ORDER.length) {
      readyFired.current = true;
      onReady?.();
    }
  };

  return (
    <group>
      {CATEGORY_ORDER.map((cat) => (
        <ModuleSlot
          key={cat}
          category={cat}
          moduleId={combination[cat]}
          exploded={exploded}
          assemblyStart={assemblyStart}
          highlighted={highlight === cat}
          interactive={interactive}
          onHover={onHover}
          onPick={onPick}
          onLoadError={onLoadError}
          onLoaded={handleLoaded}
        />
      ))}
    </group>
  );
}

