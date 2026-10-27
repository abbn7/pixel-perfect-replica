import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { buildKeycapGeometry, makeSpeckleTexture } from "./keycap";

interface Cap {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  speckled?: boolean;
  speed: number;
  phase: number;
  spin: number;
}

const NAVY = "#1d2f52";
const CREAM = "#eae5d8";
const BLUE = "#5ec0e8";
const ORANGE = "#c05a2a";

/* Scattered around the edges — the center stays clear for the hero text. */
const CAPS: Cap[] = [
  { position: [-6.6, 3.1, -2.5], rotation: [0.5, 0.6, 0.15], scale: 1.05, color: NAVY, speed: 0.6, phase: 0.3, spin: 0.35 },
  { position: [-4.4, -3.1, -1.2], rotation: [-0.4, 0.3, -0.35], scale: 0.75, color: CREAM, speckled: true, speed: 0.75, phase: 1.6, spin: 0.45 },
  { position: [-2.6, 4.7, -4.5], rotation: [0.6, -0.4, 0.2], scale: 0.9, color: CREAM, speckled: true, speed: 0.5, phase: 2.7, spin: 0.3 },
  { position: [-7.6, -0.6, -5.5], rotation: [-0.3, 0.8, 0.4], scale: 1.25, color: NAVY, speed: 0.45, phase: 4.1, spin: 0.28 },
  { position: [-5.9, 0.9, -3.8], rotation: [0.35, -0.55, -0.25], scale: 0.62, color: CREAM, speckled: true, speed: 0.85, phase: 5.4, spin: 0.5 },
  { position: [3.1, 3.9, -2.2], rotation: [-0.5, 0.45, 0.3], scale: 0.95, color: CREAM, speckled: true, speed: 0.65, phase: 0.9, spin: 0.4 },
  { position: [5.4, 5.1, -4.5], rotation: [0.4, -0.3, -0.2], scale: 0.8, color: BLUE, speed: 0.55, phase: 2.1, spin: 0.33 },
  { position: [6.9, -2.3, -1.6], rotation: [-0.35, -0.65, 0.3], scale: 1.05, color: ORANGE, speed: 0.7, phase: 3.3, spin: 0.42 },
  { position: [4.6, -3.9, -3.2], rotation: [0.45, 0.35, -0.3], scale: 0.85, color: NAVY, speed: 0.6, phase: 4.8, spin: 0.36 },
  { position: [1.2, -5.0, -4.5], rotation: [-0.55, 0.5, 0.25], scale: 0.95, color: NAVY, speed: 0.5, phase: 1.2, spin: 0.3 },
  { position: [8.2, 1.6, -6.5], rotation: [0.3, 0.7, -0.15], scale: 1.3, color: CREAM, speckled: true, speed: 0.4, phase: 5.9, spin: 0.25 },
  { position: [-8.4, 4.4, -6.0], rotation: [-0.45, -0.35, 0.35], scale: 1.15, color: CREAM, speckled: true, speed: 0.42, phase: 2.9, spin: 0.27 },
];

function Keycap({
  cap,
  geometry,
  speckleMap,
}: {
  cap: Cap;
  geometry: THREE.BufferGeometry;
  speckleMap: THREE.Texture;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame((state, rawDelta) => {
    const mesh = ref.current;
    if (!mesh || reduced.current) return;
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime + cap.phase;
    mesh.position.y = cap.position[1] + Math.sin(t * cap.speed) * 0.3;
    mesh.position.x = cap.position[0] + Math.cos(t * cap.speed * 0.8) * 0.2;
    mesh.rotation.x = cap.rotation[0] + Math.sin(t * cap.spin) * 0.18;
    mesh.rotation.y = cap.rotation[1] + Math.cos(t * cap.spin * 0.85) * 0.22;
    mesh.rotation.z = cap.rotation[2] + Math.sin(t * cap.spin * 0.6) * 0.14;
  });

  return (
    <mesh ref={ref} geometry={geometry} position={cap.position} rotation={cap.rotation} scale={cap.scale}>
      <meshPhysicalMaterial
        color={cap.speckled ? "#ffffff" : cap.color}
        map={cap.speckled ? speckleMap : null}
        roughness={0.32}
        clearcoat={0.9}
        clearcoatRoughness={0.28}
        envMapIntensity={0.85}
      />
    </mesh>
  );
}

function Field({ geometry, speckleMap }: { geometry: THREE.BufferGeometry; speckleMap: THREE.Texture }) {
  const group = useRef<THREE.Group>(null);
  const { size } = useThree();
  const fit = Math.min(1, Math.max(0.5, size.width / 1400));

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.05);
    // Mouse parallax — frame-rate-independent exponential lerp.
    const k = 1 - Math.exp(-3 * delta);
    g.rotation.y += (state.pointer.x * 0.12 - g.rotation.y) * k;
    g.rotation.x += (-state.pointer.y * 0.08 - g.rotation.x) * k;
  });

  return (
    <group ref={group} scale={fit}>
      {CAPS.map((cap, i) => (
        <Keycap key={i} cap={cap} geometry={geometry} speckleMap={speckleMap} />
      ))}
    </group>
  );
}

export default function KeycapScene() {
  const geometry = useMemo(() => buildKeycapGeometry(), []);
  const speckleMap = useMemo(() => makeSpeckleTexture(), []);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      geometry.dispose();
      speckleMap.dispose();
    };
  }, [geometry, speckleMap]);

  useEffect(() => {
    wrapperRef.current?.setAttribute("data-scene-ready", "");
  }, []);

  return (
    <div ref={wrapperRef} aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 11], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={["#f3f2ee", 12, 26]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 9, 7]} intensity={1.5} />
        <directionalLight position={[-7, -5, 5]} intensity={0.5} />
        <Environment resolution={128}>
          <Lightformer intensity={2.2} position={[0, 6, 2]} scale={[12, 6, 1]} color="#ffffff" />
          <Lightformer intensity={1.2} position={[-6, 1, 1]} rotation-y={Math.PI / 2} scale={[14, 3, 1]} color="#dcecf7" />
          <Lightformer intensity={1} position={[6, -2, 1]} rotation-y={-Math.PI / 2} scale={[14, 3, 1]} color="#f6efe0" />
        </Environment>
        <Field geometry={geometry} speckleMap={speckleMap} />
      </Canvas>
    </div>
  );
}
