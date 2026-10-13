import { ContactShadows, Environment, Grid, Lightformer } from '@react-three/drei';
import { GROUND_Y, SCENE_SCALE } from '@/data/frames/standard';

/** Estúdio escuro: luz principal, recorte, reflexos suaves e sombra de contato. */
export default function Studio({
  grid = true,
  shadows = true,
  floor = true,
  background = true,
}: {
  grid?: boolean;
  shadows?: boolean;
  floor?: boolean;
  background?: boolean;
}) {
  const groundY = GROUND_Y * SCENE_SCALE;
  return (
    <>
      {background && <color attach="background" args={['#080808']} />}
      <fog attach="fog" args={['#080808', 5.5, 13]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[2.6, 4.2, 2.2]}
        intensity={2.6}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-2, 2, 2, -2, 0.1, 10]} />
      </directionalLight>
      {/* Luz de recorte quente, por trás */}
      <spotLight position={[-3, 2.2, -3.2]} angle={0.45} penumbra={1} intensity={14} color="#ff642f" />
      <spotLight position={[3.4, 1.4, -2.6]} angle={0.6} penumbra={1} intensity={9} color="#f5f5f5" />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3.2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1.8} position={[-5, 1.5, 0]} rotation-y={Math.PI / 2} scale={[8, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.8} position={[5, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[8, 1.2, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#ff642f" position={[0, 1, -6]} scale={[10, 0.6, 1]} />
      </Environment>

      {floor && (
        <mesh rotation-x={-Math.PI / 2} position={[0, groundY - 0.002, 0]} receiveShadow>
          <circleGeometry args={[12, 64]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.95} metalness={0} />
        </mesh>
      )}
      {grid && (
        <Grid
          position={[0, groundY, 0]}
          args={[20, 20]}
          cellSize={0.1}
          cellThickness={0.5}
          cellColor="#1b1b1b"
          sectionSize={1}
          sectionThickness={0.9}
          sectionColor="#2c2c2c"
          fadeDistance={9}
          fadeStrength={1.6}
          infiniteGrid
        />
      )}
      {shadows && (
        <ContactShadows
          position={[0, groundY + 0.001, 0]}
          opacity={0.75}
          scale={5}
          blur={2.2}
          far={1.2}
          resolution={512}
          color="#000000"
        />
      )}
    </>
  );
}
