import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import { useBuilder, type CameraView } from '@/store/builder';
import { easeInOutCubic, reducedMotion } from '@/lib/motion';
import RobotAssembly from './RobotAssembly';
import Studio from './Studio';

/* ==========================================================================
   Cena do montador: estúdio, robô e câmera orbital com vistas prontas.
   A câmera só muda quando o usuário gira/aproxima ou pede uma vista.
   ========================================================================== */

const TARGET = new THREE.Vector3(0, 0.12, 0.1);

const VIEWS: Record<CameraView, { dir: [number, number, number]; dist: number; target?: [number, number, number] }> = {
  padrao: { dir: [0.62, 0.46, 0.72], dist: 5.0 },
  superior: { dir: [0, 1, 0.0001], dist: 5.2, target: [0, 0, 0] },
  frontal: { dir: [0, 0.12, 1], dist: 4.6 },
  lateral: { dir: [1, 0.12, 0], dist: 4.6 },
};

function viewPose(name: CameraView, aspect: number) {
  const v = VIEWS[name];
  // Em telas em pé o robô precisa de mais distância para caber.
  const fit = aspect < 1 ? Math.min(1.9, 1.05 / aspect) : 1;
  const dir = new THREE.Vector3(...v.dir).normalize();
  const target = v.target ? new THREE.Vector3(...v.target) : TARGET.clone();
  return { position: target.clone().addScaledVector(dir, v.dist * fit), target };
}

function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const view = useBuilder((s) => s.view);
  const tween = useRef<{
    from: THREE.Vector3;
    to: THREE.Vector3;
    tFrom: THREE.Vector3;
    tTo: THREE.Vector3;
    start: number;
    dur: number;
  } | null>(null);
  const first = useRef(true);

  // Posição inicial
  useEffect(() => {
    if (!first.current) return;
    first.current = false;
    const pose = viewPose(view.name, size.width / size.height);
    camera.position.copy(pose.position);
    controls?.target.copy(pose.target);
    controls?.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls]);

  // Pedido de nova vista
  useEffect(() => {
    if (view.tick === 0 || !controls) return;
    const pose = viewPose(view.name, size.width / size.height);
    tween.current = {
      from: camera.position.clone(),
      to: pose.position,
      tFrom: controls.target.clone(),
      tTo: pose.target,
      start: performance.now(),
      dur: reducedMotion() ? 1 : 1100,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.tick]);

  // Interação do usuário cancela a transição de câmera em andamento
  useEffect(() => {
    if (!controls) return;
    const cancel = () => (tween.current = null);
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener('start', cancel);
  }, [controls]);

  useFrame(() => {
    const t = tween.current;
    if (!t || !controls) return;
    const p = Math.min(1, (performance.now() - t.start) / t.dur);
    const e = easeInOutCubic(p);
    // Interpola em coordenadas esféricas para orbitar em vez de cortar caminho
    const a = new THREE.Spherical().setFromVector3(t.from.clone().sub(t.tFrom));
    const b = new THREE.Spherical().setFromVector3(t.to.clone().sub(t.tTo));
    let dTheta = b.theta - a.theta;
    if (dTheta > Math.PI) dTheta -= Math.PI * 2;
    if (dTheta < -Math.PI) dTheta += Math.PI * 2;
    const s = new THREE.Spherical(
      a.radius + (b.radius - a.radius) * e,
      a.phi + (b.phi - a.phi) * e,
      a.theta + dTheta * e,
    );
    const target = t.tFrom.clone().lerp(t.tTo, e);
    camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(s));
    controls.target.copy(target);
    controls.update();
    if (p >= 1) tween.current = null;
  });

  return null;
}

export default function BuilderScene({ onLoadError }: { onLoadError?: (id: string) => void }) {
  const combination = useBuilder((s) => s.combination);
  const exploded = useBuilder((s) => s.exploded);
  const assemblyTick = useBuilder((s) => s.assemblyTick);
  const active = useBuilder((s) => s.activeCategory);
  const hover = useBuilder((s) => s.hoverCategory);
  const setHover = useBuilder((s) => s.setHoverCategory);
  const setActive = useBuilder((s) => s.setActiveCategory);

  useEffect(() => () => setHover(null), [setHover]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [2.2, 1.5, 2.6], fov: 32, near: 0.05, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => setHover(null)}
    >
      <Studio background={false} floor={false} />
      <RobotAssembly
        combination={combination}
        exploded={exploded}
        assemblyTick={assemblyTick}
        highlight={hover ?? active}
        interactive
        onHover={setHover}
        onPick={setActive}
        onLoadError={(id) => onLoadError?.(id)}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={8}
        maxPolarAngle={Math.PI * 0.495}
        rotateSpeed={0.8}
        zoomSpeed={0.8}
      />
      <CameraRig />
    </Canvas>
  );
}
