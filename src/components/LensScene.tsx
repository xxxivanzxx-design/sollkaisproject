import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type DragState = { tx: number; ty: number; active: boolean };
export type Finish = 'midnight' | 'silver' | 'ocean' | 'desert';

const MODEL_URL = `${import.meta.env.BASE_URL}model/source/apple_iphone_18_pro_max_black.glb`;

const FINISH_TONES: Record<Finish, string> = {
  midnight: '#26272b',
  silver: '#c5c9d1',
  ocean: '#294d70',
  desert: '#ad8b72',
};

function StudioEnv() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
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
    panel(5, 3, '#8B5CFF', [0, 0.8, -8.5]);
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

function ImportedPhoneModel({ finish }: { finish: Finish }) {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const model = useMemo(() => {
    const root = gltf.scene;
    const tone = new THREE.Color(FINISH_TONES[finish]);

    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const originalMaterials = Array.isArray(object.material) ? object.material : [object.material];
      const materials = originalMaterials.map((material) => {
        const copy = material.clone();
        const name = copy.name.toLowerCase();
        const isColourPart = name.includes('colour_') || name.includes('black_backpanel') || name.includes('black_side_panel');
        const isGlassPart = name.includes('screen') || name.includes('glass') || name.includes('lens');
        if ('color' in copy && copy.color instanceof THREE.Color) {
          if (isColourPart && !isGlassPart) {
            copy.color.copy(tone);
            if (name.includes('gloss') || name.includes('button')) copy.color.lerp(new THREE.Color('#ffffff'), 0.18);
          } else {
            copy.color.lerp(new THREE.Color('#3f414b'), 0.52);
          }
        }
        if ('envMapIntensity' in copy) copy.envMapIntensity = 1.7;
        if ('clearcoat' in copy) copy.clearcoat = Math.max(copy.clearcoat, 0.45);
        return copy;
      });
      object.material = Array.isArray(object.material) ? materials : materials[0];
    });

    return root;
  }, [gltf.scene, finish]);

  return <primitive object={model} scale={22.8} position={[0, -1.86, 0]} rotation={[0, Math.PI, 0]} />;
}

function Phone({ drag, finish }: { drag: RefObject<DragState>; finish: Finish }) {
  const group = useRef<THREE.Group>(null);
  const reflection = useRef<THREE.PointLight>(null);
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
    if (reflection.current) {
      reflection.current.position.x = Math.sin(phase.current * 0.55) * 2.6;
      reflection.current.position.y = 1.8 + Math.cos(phase.current * 0.4) * 0.9;
    }
  });
  return (
    <group ref={group} scale={0.94} rotation={[0, 0, 0]}>
      <ImportedPhoneModel finish={finish} />
      <pointLight ref={reflection} position={[2.2, 2, 2.6]} intensity={18} distance={8} color="#f4eaff" />
    </group>
  );
}

export default function LensScene({ drag, active, finish = 'midnight' }: { drag: RefObject<DragState>; active: boolean; finish?: Finish }) {
  return (
    <Canvas dpr={[1, 1.8]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} camera={{ position: [0, 0, 5.7], fov: 35 }} frameloop={active ? 'always' : 'never'} style={{ background: 'transparent' }}>
      <StudioEnv />
      <ambientLight intensity={0.58} />
      <directionalLight position={[3.4, 4.2, 5.4]} intensity={5.2} color="#fff6ef" />
      <directionalLight position={[-4.2, -1.2, 2.4]} intensity={2.1} color="#a7b8ff" />
      <directionalLight position={[0, 1.2, -4]} intensity={2.2} color="#a574ff" />
      <Phone drag={drag} finish={finish} />
    </Canvas>
  );
}
