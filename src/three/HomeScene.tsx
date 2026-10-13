import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Combination, ModuleCategory } from '@/types/content';
import { modulesOf } from '@/data/frames/catalog';
import { CATEGORY_ORDER } from '@/data/frames/standard';
import { reducedMotion } from '@/lib/motion';
import RobotAssembly from './RobotAssembly';
import Studio from './Studio';

/* Robô demonstrativo da Home: gira devagar, responde ao cursor e troca
   um módulo de tempos em tempos para mostrar o sistema de encaixe. */

function Rig({
  combination,
  pointer,
}: {
  combination: Combination;
  pointer: React.RefObject<{ x: number; y: number }>;
}) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(0.6);
  const reduce = useRef(reducedMotion());
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    if (!reduce.current) spin.current += dt * 0.12;
    const p = pointer.current ?? { x: 0, y: 0 };
    const k = 1 - Math.exp(-3 * dt);
    g.rotation.y += (spin.current + p.x * 0.45 - g.rotation.y) * k;
    g.rotation.x += (p.y * 0.08 - g.rotation.x) * k;
    // Em telas em pé, afasta a câmera para o robô caber na largura.
    const aspect = state.size.width / state.size.height;
    const fit = aspect < 1 ? Math.min(2.1, 1.15 / aspect) : 1;
    state.camera.position.x += (p.x * 0.25 - state.camera.position.x) * k;
    state.camera.position.z += (4.9 * fit - state.camera.position.z) * k;
    state.camera.position.y += (1.55 * fit - state.camera.position.y) * k;
    state.camera.lookAt(0, aspect < 1 ? 0.0 : 0.3, 0);
  });
  return (
    <group ref={group}>
      <RobotAssembly combination={combination} assembleOnMount />
    </group>
  );
}

export default function HomeScene({
  combination,
  started,
}: {
  combination: Combination;
  started: boolean;
}) {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.55, 4.9], fov: 30, near: 0.1, far: 40 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <Studio grid={false} />
      {started && <Rig combination={combination} pointer={pointer} />}
    </Canvas>
  );
}

/** Troca um módulo aleatório a cada intervalo. */
export function useCyclingCombination(initial: Combination, active: boolean, every = 3400) {
  const [combo, setCombo] = useState(initial);
  useEffect(() => {
    if (!active || reducedMotion()) return;
    let order = [...CATEGORY_ORDER];
    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (!order.length) order = [...CATEGORY_ORDER].sort(() => Math.random() - 0.5);
      const cat = order.shift() as ModuleCategory;
      setCombo((c) => {
        const list = modulesOf(cat);
        if (list.length < 2) return c;
        const idx = list.findIndex((m) => m.id === c[cat]);
        return { ...c, [cat]: list[(idx + 1) % list.length].id };
      });
    }, every);
    return () => window.clearInterval(id);
  }, [active, every]);
  return combo;
}
