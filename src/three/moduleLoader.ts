import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import type { ModuleDefinition } from '@/types/content';
import { asset, PREVIEW } from '@/lib/motion';
import { stlMaterial } from './materials';

/* ==========================================================================
   Carrega a representação 3D de um módulo.
   Prioridade: modelo GLB/GLTF → STL.
   Cada chamada devolve uma instância independente (materiais clonados),
   para que cada peça possa ter sua própria opacidade e realce.
   ========================================================================== */

const gltfLoader = new GLTFLoader();
const stlLoader = new STLLoader();
const sourceCache = new Map<string, Promise<THREE.Object3D>>();
/** Geometrias vindas de arquivos ficam em cache e são compartilhadas entre clones. */
const sourceGeometry = new WeakSet<THREE.BufferGeometry>();

const registerGeometry = (obj: THREE.Object3D) => {
  obj.traverse((c) => {
    const m = c as THREE.Mesh;
    if (m.isMesh) sourceGeometry.add(m.geometry);
  });
  return obj;
};

function loadSource(path: string): Promise<THREE.Object3D> {
  const hit = sourceCache.get(path);
  if (hit) return hit;
  const url = asset(path);
  const p = /\.stl$/i.test(path)
    ? stlLoader.loadAsync(url).then((geo) => {
        geo.computeVertexNormals();
        const m = new THREE.Mesh(geo, stlMaterial());
        m.castShadow = true;
        m.receiveShadow = true;
        return m as THREE.Object3D;
      })
    : (PREVIEW
        ? // Na prévia online o GLB é servido como texto base64 (.glb.txt)
          fetch(`${url}.txt`)
            .then((r) => r.text())
            .then((b64) => {
              const bin = atob(b64.trim());
              const buf = new Uint8Array(bin.length);
              for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
              return gltfLoader.parseAsync(buf.buffer, '');
            })
        : gltfLoader.loadAsync(url)
      ).then((gltf) => {
        gltf.scene.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        return gltf.scene as THREE.Object3D;
      });
  const registered = p.then(registerGeometry);
  registered.catch(() => sourceCache.delete(path));
  sourceCache.set(path, registered);
  return registered;
}

function cloneDeep(src: THREE.Object3D) {
  const copy = src.clone(true);
  copy.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map((m) => m.clone())
        : mesh.material.clone();
    }
  });
  return copy;
}

/** Aplica escala de unidade e correção de encaixe declaradas no catálogo. */
function wrap(def: ModuleDefinition, inner: THREE.Object3D) {
  const root = new THREE.Group();
  const scale = def.unitScale ?? 1;
  inner.scale.multiplyScalar(scale);
  const p = def.offset?.position;
  const r = def.offset?.rotation;
  if (p) inner.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0);
  if (r)
    inner.rotation.set(
      THREE.MathUtils.degToRad(r.x ?? 0),
      THREE.MathUtils.degToRad(r.y ?? 0),
      THREE.MathUtils.degToRad(r.z ?? 0),
    );
  root.add(inner);
  root.userData.moduleId = def.id;
  return root;
}

export async function loadModuleObject(def: ModuleDefinition): Promise<THREE.Object3D> {
  if (def.model || def.stl) {
    try {
      const src = await loadSource((def.model ?? def.stl)!);
      return wrap(def, cloneDeep(src));
    } catch (err) {
      // Se o GLB falhar mas houver STL, tenta o STL.
      if (def.model && def.stl) {
        const src = await loadSource(def.stl);
        return wrap(def, cloneDeep(src));
      }
      throw err;
    }
  }
  throw new Error(`Módulo ${def.id} não possui modelo 3D cadastrado.`);
}

/** Libera geometrias e materiais de uma instância removida da cena. */
export function disposeObject(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((m) => m.dispose());
    if (mesh.geometry && !sourceGeometry.has(mesh.geometry)) mesh.geometry.dispose();
  });
}
