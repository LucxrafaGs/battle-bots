import * as THREE from 'three';

/** Material padrão para peças carregadas de STL (sem cor própria). */
export const stlMaterial = () =>
  new THREE.MeshStandardMaterial({ color: 0x55565c, metalness: 0.45, roughness: 0.5 });
