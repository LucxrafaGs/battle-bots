import * as THREE from 'three';
import type { ModuleDefinition } from '@/types/content';
import { disposeObject, loadModuleObject } from './moduleLoader';

/* ==========================================================================
   Miniaturas automáticas.
   Quando a peça não possui imagem de miniatura cadastrada, uma imagem é
   renderizada a partir do próprio modelo 3D, uma única vez, e guardada em
   memória.
   ========================================================================== */

const SIZE = 256;
const cache = new Map<string, Promise<string>>();
let renderer: THREE.WebGLRenderer | null = null;
let queue: Promise<unknown> = Promise.resolve();

function getRenderer() {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(SIZE, SIZE, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
  }
  return renderer;
}

function render(obj: THREE.Object3D): string {
  const r = getRenderer();
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x303030, 2.6));
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(2, 3, 2.5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff642f, 1.6);
  rim.position.set(-3, 1, -2);
  scene.add(rim);

  scene.add(obj);
  const box = new THREE.Box3().setFromObject(obj);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = size.length() * 0.5 || 1;

  const cam = new THREE.PerspectiveCamera(30, 1, radius * 0.1, radius * 20);
  const dir = new THREE.Vector3(1, 0.8, 1.15).normalize();
  cam.position.copy(center).addScaledVector(dir, (radius / Math.sin(THREE.MathUtils.degToRad(15))) * 1.02);
  cam.lookAt(center);

  r.setClearColor(0x000000, 0);
  r.render(scene, cam);
  const url = r.domElement.toDataURL('image/png');
  scene.remove(obj);
  return url;
}

export function getThumbnail(def: ModuleDefinition): Promise<string> {
  const hit = cache.get(def.id);
  if (hit) return hit;
  const job = queue.then(async () => {
    const obj = await loadModuleObject(def);
    try {
      return render(obj);
    } finally {
      disposeObject(obj);
    }
  });
  queue = job.catch(() => undefined);
  cache.set(def.id, job);
  return job;
}
