import { useCallback, useEffect, useState } from 'react';
import type * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Bounds, Center, OrbitControls } from '@react-three/drei';
import { disposeObject, loadModuleObject } from './moduleLoader';
import Studio from './Studio';

/* Visualizador simples de um arquivo GLB/GLTF/STL (guias de montagem). */
function Model({ src, onError }: { src: string; onError: () => void }) {
  const [obj, setObj] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    let alive = true;
    let loaded: THREE.Object3D | null = null;
    const isStl = /\.stl$/i.test(src);
    loadModuleObject({
      id: src,
      category: 'frame',
      name: src,
      standard: '',
      ...(isStl ? { stl: src } : { model: src }),
    })
      .then((o) => {
        loaded = o;
        if (alive) setObj(o);
        else disposeObject(o);
      })
      .catch(() => alive && onError());
    return () => {
      alive = false;
      if (loaded) disposeObject(loaded);
    };
  }, [src, onError]);
  if (!obj) return null;
  return (
    <Bounds fit clip observe margin={1.25}>
      <Center>
        <primitive object={obj} />
      </Center>
    </Bounds>
  );
}

export default function ModelViewer({ src }: { src: string }) {
  const [error, setError] = useState(false);
  const onError = useCallback(() => setError(true), []);
  if (error) return <p className="media-error">Não foi possível carregar o modelo {src}.</p>;
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [2, 1.4, 2.4], fov: 32 }} data-cursor="Girar">
      <Studio grid={false} floor={false} shadows={false} />
      <Model src={src} onError={onError} />
      <OrbitControls makeDefault enablePan={false} autoRotate autoRotateSpeed={0.8} />
    </Canvas>
  );
}
