import { useLayoutEffect, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type DragState = { tx: number; ty: number; active: boolean };

const KNURL_COUNT = 76;

/**
 * A procedural "lightbox studio" baked into a PMREM environment map.
 * Without it a near-black metal barrel has nothing to reflect and reads as a blob.
 */
function StudioEnv() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = new THREE.Scene();
    const made: THREE.Mesh[] = [];

    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(14, 32, 32),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#08080a'), side: THREE.BackSide }),
    );
    envScene.add(shell);
    made.push(shell);

    const panel = (
      w: number,
      h: number,
      rgb: [number, number, number],
      pos: [number, number, number],
    ) => {
      const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
      mat.color.setRGB(rgb[0], rgb[1], rgb[2]);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.lookAt(0, 0, 0);
      envScene.add(mesh);
      made.push(mesh);
    };

    // overhead key softbox, slightly in front
    panel(10, 6, [3.4, 3.2, 3.05], [0, 6.4, 2.6]);
    // cool strip, right
    panel(1.3, 11, [0.85, 1.0, 1.35], [7.2, 0.6, 1.8]);
    // warm strip, left
    panel(1.3, 11, [1.6, 1.45, 1.25], [-7.2, 0.6, 1.8]);
    // the orange rim behind the lens
    panel(7, 4, [2.2, 0.62, 0.2], [0, 0.8, -8.5]);
    // softbox in front of the lens, so the flat glass gets a highlight
    panel(2.8, 1.6, [1.5, 1.4, 1.3], [0, 2.2, 11]);
    // narrow strip, front right
    panel(0.5, 4.2, [1.2, 1.35, 1.5], [4.6, 0.4, 10.4]);

    const rt = pmrem.fromScene(envScene, 0.03);
    scene.environment = rt.texture;

    return () => {
      scene.environment = null;
      rt.dispose();
      pmrem.dispose();
      made.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
    };
  }, [gl, scene]);

  return null;
}

function Knurl() {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < KNURL_COUNT; i += 1) {
      const a = (i / KNURL_COUNT) * Math.PI * 2;
      p.set(Math.cos(a) * 1.055, Math.sin(a) * 1.055, 0.02);
      q.setFromEuler(new THREE.Euler(0, 0, a));
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, KNURL_COUNT]}>
      <boxGeometry args={[0.022, 0.042, 0.3]} />
      <meshStandardMaterial color="#1e1e23" metalness={0.72} roughness={0.46} />
    </instancedMesh>
  );
}

function Lens({ drag }: { drag: RefObject<DragState> }) {
  const group = useRef<THREE.Group>(null);
  const current = useRef({ x: -0.12, y: 0.42 });
  const phase = useRef(0);

  useFrame((_, delta) => {
    const g = group.current;
    const d = drag.current;
    if (!g || !d) return;
    const k = Math.min(1, delta * 6.5);
    current.current.y += (d.ty - current.current.y) * k;
    current.current.x += (d.tx - current.current.x) * k;
    g.rotation.y = current.current.y;
    g.rotation.x = THREE.MathUtils.clamp(current.current.x, -0.6, 0.6);
    // idle: a slow breath around the three-quarter view, never a full spin
    if (!d.active) {
      phase.current += delta;
      d.ty = 0.42 + Math.sin(phase.current * 0.2) * 0.2;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* barrel */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[1.0, 1.02, 0.92, 96, 1, false]} />
        <meshStandardMaterial color="#1a1a20" metalness={0.9} roughness={0.32} />
      </mesh>

      {/* rear collar */}
      <mesh position={[0, 0, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.06, 1.06, 0.1, 96]} />
        <meshStandardMaterial color="#0c0c0f" metalness={0.85} roughness={0.42} />
      </mesh>

      {/* knurled focus ring */}
      <Knurl />
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]}>
        <cylinderGeometry args={[1.045, 1.045, 0.3, 96, 1, true]} />
        <meshStandardMaterial color="#101013" metalness={0.92} roughness={0.5} />
      </mesh>

      {/* front bezel — an open ring, so the glass is actually visible through it */}
      <mesh position={[0, 0, 0.47]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.09, 96, 1, true]} />
        <meshStandardMaterial
          color="#17171c"
          metalness={0.96}
          roughness={0.16}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, 0.506]}>
        <ringGeometry args={[0.9, 1.0, 96]} />
        <meshStandardMaterial color="#1b1b21" metalness={0.95} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* inner retaining ring around the element */}
      <mesh position={[0, 0, 0.508]}>
        <ringGeometry args={[0.775, 0.9, 96]} />
        <meshStandardMaterial color="#0d0d10" metalness={0.85} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.5]}>
        <torusGeometry args={[0.985, 0.018, 16, 96]} />
        <meshStandardMaterial color="#2a2a31" metalness={0.98} roughness={0.12} />
      </mesh>

      {/* the one orange ring */}
      <mesh position={[0, 0, 0.514]}>
        <torusGeometry args={[0.948, 0.011, 12, 96]} />
        <meshStandardMaterial
          color="#ff5a1f"
          emissive="#ff5a1f"
          emissiveIntensity={1.9}
          metalness={0.3}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>

      {/* inner barrel + aperture */}
      <mesh position={[0, 0, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.86, 0.8, 0.2, 96, 1, true]} />
        <meshStandardMaterial color="#050507" metalness={0.6} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.28]}>
        <circleGeometry args={[0.7, 64]} />
        <meshStandardMaterial color="#030304" metalness={0.5} roughness={0.55} />
      </mesh>

      {/* front element — dark glass dome */}
      {/* a very flat meniscus: radius 3.43, 13.1° cap → 0.78 rim, 0.09 of bulge */}
      <mesh position={[0, 0, -2.84]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[3.43, 96, 96, 0, Math.PI * 2, 0, 0.2295]} />
        <meshPhysicalMaterial
          color="#05070d"
          metalness={0.05}
          roughness={0.075}
          clearcoat={1}
          clearcoatRoughness={0.03}
          ior={1.55}
          reflectivity={0.9}
          specularIntensity={1}
          envMapIntensity={1.5}
          emissive="#0a1424"
          emissiveIntensity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* faint inner glow behind the glass */}
      <pointLight position={[0, 0, 0.1]} intensity={1.1} distance={1.4} color="#2b3a63" />
    </group>
  );
}

export default function LensScene({ drag, active }: { drag: RefObject<DragState>; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 6.2], fov: 33 }}
      frameloop={active ? 'always' : 'never'}
      style={{ background: 'transparent' }}
    >
      <StudioEnv />
      <ambientLight intensity={0.28} />
      <directionalLight position={[3.4, 4.2, 5.4]} intensity={3.1} color="#fff6ef" />
      <directionalLight position={[-4.2, -1.2, 2.4]} intensity={1.0} color="#8fa0c9" />
      <directionalLight position={[0, 1.2, -4]} intensity={1.4} color="#ff6a2a" />
      <pointLight position={[0.6, 1.8, 3.4]} intensity={14} distance={8} color="#ffffff" />
      <pointLight position={[-2.4, -1.4, 2.2]} intensity={10} distance={7} color="#ff8a55" />
      <Lens drag={drag} />
    </Canvas>
  );
}
