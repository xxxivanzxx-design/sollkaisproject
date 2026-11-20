import { useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type DragState = { tx: number; ty: number; active: boolean };
export type Finish = 'midnight' | 'silver' | 'ocean' | 'desert';

const FINISH_COLORS: Record<Finish, string> = {
  midnight: '#26272b',
  silver: '#b8bbc1',
  ocean: '#1d405d',
  desert: '#a8896f',
};

function roundedShape(width: number, height: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const s = new THREE.Shape();
  s.moveTo(x + radius, y);
  s.lineTo(x + width - radius, y);
  s.quadraticCurveTo(x + width, y, x + width, y + radius);
  s.lineTo(x + width, y + height - radius);
  s.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  s.lineTo(x + radius, y + height);
  s.quadraticCurveTo(x, y + height, x, y + height - radius);
  s.lineTo(x, y + radius);
  s.quadraticCurveTo(x, y, x + radius, y);
  return s;
}

function StudioEnv() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = new THREE.Scene();
    const made: THREE.Mesh[] = [];
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(14, 32, 32),
      new THREE.MeshBasicMaterial({ color: '#08080a', side: THREE.BackSide }),
    );
    envScene.add(shell);
    made.push(shell);
    const panel = (w: number, h: number, color: string, pos: [number, number, number]) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
      mesh.position.set(...pos);
      mesh.lookAt(0, 0, 0);
      envScene.add(mesh);
      made.push(mesh);
    };
    panel(10, 6, '#d9d1c4', [0, 6.4, 2.6]);
    panel(1.3, 11, '#7894c6', [7.2, 0.6, 1.8]);
    panel(1.3, 11, '#d28d6e', [-7.2, 0.6, 1.8]);
    panel(5, 3, '#ff5a1f', [0, 0.8, -8.5]);
    const rt = pmrem.fromScene(envScene, 0.03);
    scene.environment = rt.texture;
    return () => {
      scene.environment = null;
      rt.dispose();
      pmrem.dispose();
      made.forEach((m) => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
    };
  }, [gl, scene]);
  return null;
}

function RoundedBody({ color }: { color: string }) {
  const body = useMemo(() => roundedShape(1.82, 3.7, 0.28), []);
  const screen = useMemo(() => roundedShape(1.66, 3.5, 0.24), []);
  const island = useMemo(() => roundedShape(0.82, 0.96, 0.16), []);
  return (
    <>
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[body, { depth: 0.28, bevelEnabled: true, bevelSegments: 5, bevelSize: 0.055, bevelThickness: 0.045, curveSegments: 8 }]} />
        <meshPhysicalMaterial color={color} metalness={0.86} roughness={0.28} clearcoat={0.35} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.18]}>
        <extrudeGeometry args={[screen, { depth: 0.018, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.035, bevelThickness: 0.02 }]} />
        <meshPhysicalMaterial color="#080b12" metalness={0.12} roughness={0.12} clearcoat={1} clearcoatRoughness={0.03} transmission={0.06} />
      </mesh>
      <mesh position={[0, 0, 0.205]}>
        <planeGeometry args={[1.42, 3.1]} />
        <meshBasicMaterial color="#111a2f" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 1.32, 0.225]}>
        <capsuleGeometry args={[0.105, 0.28, 8, 20]} />
        <meshStandardMaterial color="#020204" roughness={0.18} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0, -0.17]} rotation={[Math.PI, 0, 0]}>
        <extrudeGeometry args={[screen, { depth: 0.014, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.03, bevelThickness: 0.015 }]} />
        <meshPhysicalMaterial color="#101116" metalness={0.18} roughness={0.18} clearcoat={1} />
      </mesh>
      <mesh position={[0.42, 0.85, -0.24]}>
        <extrudeGeometry args={[island, { depth: 0.055, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.045, bevelThickness: 0.025 }]} />
        <meshStandardMaterial color="#090a0d" metalness={0.6} roughness={0.28} />
      </mesh>
      {[[-0.02, 0.96], [0.22, 0.96], [0.1, 0.7]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, -0.29]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.04, 32]} />
          <meshPhysicalMaterial color="#15171b" metalness={0.7} roughness={0.18} clearcoat={0.8} />
        </mesh>
      ))}
      <mesh position={[-0.94, 0.86, 0]}>
        <boxGeometry args={[0.06, 0.36, 0.12]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[-0.94, 0.38, 0]}>
        <boxGeometry args={[0.06, 0.18, 0.12]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0.94, 0.58, 0]}>
        <boxGeometry args={[0.06, 0.3, 0.12]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.25} />
      </mesh>
    </>
  );
}

function Phone({ drag, finish }: { drag: RefObject<DragState>; finish: Finish }) {
  const group = useRef<THREE.Group>(null);
  const current = useRef({ x: -0.18, y: 0.48 });
  const phase = useRef(0);
  useFrame((_, delta) => {
    const g = group.current;
    const d = drag.current;
    if (!g || !d) return;
    const k = Math.min(1, delta * 6.5);
    current.current.y += (d.ty - current.current.y) * k;
    current.current.x += (d.tx - current.current.x) * k;
    g.rotation.y = current.current.y;
    g.rotation.x = THREE.MathUtils.clamp(current.current.x, -0.7, 0.7);
    if (!d.active) {
      phase.current += delta;
      d.ty = 0.48 + Math.sin(phase.current * 0.2) * 0.18;
    }
  });
  return <group ref={group} scale={0.94} rotation={[0, 0, 0]}><RoundedBody color={FINISH_COLORS[finish]} /></group>;
}

export default function LensScene({ drag, active, finish = 'midnight' }: { drag: RefObject<DragState>; active: boolean; finish?: Finish }) {
  return (
    <Canvas dpr={[1, 1.8]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} camera={{ position: [0, 0, 5.7], fov: 35 }} frameloop={active ? 'always' : 'never'} style={{ background: 'transparent' }}>
      <StudioEnv />
      <ambientLight intensity={0.34} />
      <directionalLight position={[3.4, 4.2, 5.4]} intensity={3.2} color="#fff6ef" />
      <directionalLight position={[-4.2, -1.2, 2.4]} intensity={1.3} color="#8fa0c9" />
      <directionalLight position={[0, 1.2, -4]} intensity={1.5} color="#ff6a2a" />
      <Phone drag={drag} finish={finish} />
    </Canvas>
  );
}
