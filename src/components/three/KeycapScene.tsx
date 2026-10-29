import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { buildKeycapGeometry, makeSpeckleTexture, makeStarTexture } from "./keycap";

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

const NAVY = "#233558";
const CREAM = "#e3dbcb";
const BLUE = "#6cb9e6";
const ORANGE = "#bd5f33";

/*
 * Layout mirrors cua.ai: sharp mid-ground caps clustered around the edges,
 * huge out-of-focus caps crowding the camera at the corners, and blurred
 * shapes sinking into black far back. The center stays clear for hero text.
 */
const CAPS: Cap[] = [
  // Near-camera corner caps — deliberately huge and defocused.
  { position: [-5.2, -3.1, 6.8], rotation: [0.18, -0.3, 0.12], scale: 1.8, color: CREAM, speckled: true, speed: 0.22, phase: 0.4, spin: 0.08 },
  { position: [-4.7, 3.2, 7.4], rotation: [-0.14, 0.26, -0.1], scale: 1.7, color: CREAM, speckled: true, speed: 0.2, phase: 2.2, spin: 0.07 },
  { position: [5.7, -1.5, 7.0], rotation: [0.12, 0.34, 0.15], scale: 1.6, color: CREAM, speckled: true, speed: 0.24, phase: 3.7, spin: 0.09 },
  { position: [5.0, 3.7, 6.4], rotation: [-0.2, -0.22, 0.1], scale: 1.4, color: NAVY, speed: 0.26, phase: 5.1, spin: 0.1 },

  // Sharp mid-ground field.
  { position: [7.2, 2.4, -3.0], rotation: [-0.12, 0.1, 0.06], scale: 1.15, color: BLUE, speed: 0.5, phase: 0.9, spin: 0.3 },
  { position: [7.0, -1.6, -3.4], rotation: [0.16, -0.12, -0.08], scale: 1.3, color: ORANGE, speed: 0.44, phase: 3.3, spin: 0.26 },
  { position: [5.8, -4.6, -2.8], rotation: [0.1, 0.16, 0.1], scale: 0.9, color: CREAM, speckled: true, speed: 0.62, phase: 1.6, spin: 0.35 },
  { position: [6.4, 4.3, -5.0], rotation: [-0.1, -0.18, 0.12], scale: 1.05, color: NAVY, speed: 0.4, phase: 2.1, spin: 0.24 },
  { position: [3.9, 4.7, -4.2], rotation: [0.14, -0.08, -0.06], scale: 0.8, color: CREAM, speckled: true, speed: 0.55, phase: 4.8, spin: 0.28 },
  { position: [-6.5, 3.8, -3.8], rotation: [-0.1, 0.14, -0.08], scale: 1.0, color: CREAM, speckled: true, speed: 0.48, phase: 2.9, spin: 0.3 },
  { position: [-6.3, -2.0, -4.0], rotation: [0.12, -0.16, 0.1], scale: 1.25, color: CREAM, speckled: true, speed: 0.42, phase: 5.4, spin: 0.22 },
  { position: [-3.5, -4.5, -3.0], rotation: [-0.14, 0.1, 0.06], scale: 0.85, color: NAVY, speed: 0.58, phase: 1.2, spin: 0.32 },
  { position: [-8.1, 0.6, -6.0], rotation: [0.08, 0.2, -0.1], scale: 1.4, color: CREAM, speckled: true, speed: 0.36, phase: 4.0, spin: 0.2 },
  { position: [-6.0, 5.2, -6.5], rotation: [-0.12, -0.14, 0.14], scale: 1.0, color: BLUE, speed: 0.45, phase: 0.3, spin: 0.27 },

  // Far background — sinking into the fog.
  { position: [2.6, -5.8, -10.0], rotation: [0.1, -0.1, 0.08], scale: 1.7, color: CREAM, speckled: true, speed: 0.3, phase: 2.6, spin: 0.16 },
  { position: [-2.7, 5.9, -10.5], rotation: [-0.08, 0.12, -0.06], scale: 1.5, color: CREAM, speckled: true, speed: 0.28, phase: 5.9, spin: 0.15 },
  { position: [8.4, 0.2, -11.0], rotation: [0.1, 0.14, 0.1], scale: 1.9, color: NAVY, speed: 0.25, phase: 3.9, spin: 0.14 },
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
  const { size } = useThree();
  // Narrow viewports squeeze the field inward — spread caps horizontally
  // outward instead of scaling the group, so cap shapes stay undistorted.
  const stretch = Math.max(1, 1.55 / (size.width / size.height));


  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame((state, rawDelta) => {
    const mesh = ref.current;
    if (!mesh || reduced.current) return;
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime + cap.phase;
    mesh.position.y = cap.position[1] + Math.sin(t * cap.speed) * 0.28;
    mesh.position.x = cap.position[0] * stretch + Math.cos(t * cap.speed * 0.8) * 0.18;
    mesh.rotation.x = cap.rotation[0] + Math.sin(t * cap.spin) * 0.1;
    mesh.rotation.y = cap.rotation[1] + Math.cos(t * cap.spin * 0.85) * 0.14;
    mesh.rotation.z = cap.rotation[2] + Math.sin(t * cap.spin * 0.6) * 0.08;
  });

  return (
    <mesh ref={ref} geometry={geometry} position={cap.position} rotation={cap.rotation} scale={cap.scale}>
      {/* Matte unglazed ceramic: high roughness, faint clearcoat, warm sheen. */}
      <meshPhysicalMaterial
        color={cap.speckled ? "#ffffff" : cap.color}
        map={cap.speckled ? speckleMap : null}
        roughness={0.62}
        metalness={0}
        clearcoat={0.22}
        clearcoatRoughness={0.65}
        sheen={0.45}
        sheenRoughness={0.85}
        sheenColor={"#fff3e2"}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}

function Field({ geometry, speckleMap }: { geometry: THREE.BufferGeometry; speckleMap: THREE.Texture }) {
  const group = useRef<THREE.Group>(null);
  const { size } = useThree();
  const fit = Math.min(1, Math.max(0.55, size.width / 1400));

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 0.05);
    // Mouse parallax — frame-rate-independent exponential lerp.
    const k = 1 - Math.exp(-3 * delta);
    g.rotation.y += (state.pointer.x * 0.07 - g.rotation.y) * k;
    g.rotation.x += (-state.pointer.y * 0.05 - g.rotation.x) * k;
  });

  return (
    <group ref={group} scale={fit}>
      {CAPS.map((cap, i) => (
        <Keycap key={i} cap={cap} geometry={geometry} speckleMap={speckleMap} />
      ))}
    </group>
  );
}

/** Tiny stars scattered through the black — two layers, soft sprites. */
function Starfield() {
  const layer = useRef<THREE.Points>(null);
  const starTexture = useMemo(() => makeStarTexture(), []);
  const layers = useMemo(() => {
    const build = (count: number, spread: number, depth: [number, number]) => {
      let seed = 19;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (rand() - 0.5) * spread;
        positions[i * 3 + 1] = (rand() - 0.5) * spread * 0.62;
        positions[i * 3 + 2] = depth[0] - rand() * (depth[1] - depth[0]);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      return geo;
    };
    return [
      { geometry: build(380, 46, [-9, -34]), size: 0.12, opacity: 0.75 },
      { geometry: build(60, 46, [-9, -30]), size: 0.28, opacity: 0.95 },
    ];
  }, []);

  useEffect(() => {
    return () => {
      starTexture.dispose();
      layers.forEach((l) => l.geometry.dispose());
    };
  }, [starTexture, layers]);

  useFrame((state, rawDelta) => {
    const p = layer.current;
    if (!p || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const delta = Math.min(rawDelta, 0.05);
    p.rotation.z += delta * 0.006;
  });

  return (
    <group ref={layer}>
      {layers.map((l, i) => (
        <points key={i} geometry={l.geometry} frustumCulled={false}>
          <pointsMaterial
            map={starTexture}
            size={l.size}
            sizeAttenuation
            transparent
            opacity={l.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
            color="#dfe6f2"
          />
        </points>
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
        camera={{ position: [0, 0, 11], fov: 45, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <fog attach="fog" args={["#050506", 15, 38]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 8, 6]} intensity={2.4} color="#fff2e2" />
        <directionalLight position={[-7, -3, 4]} intensity={0.8} color="#cfe3f5" />
        <Environment resolution={128}>
          <Lightformer intensity={2.4} position={[0, 6, 2]} scale={[12, 6, 1]} color="#ffffff" />
          <Lightformer intensity={1.1} position={[-6, 1, 1]} rotation-y={Math.PI / 2} scale={[14, 3, 1]} color="#cfe0f2" />
          <Lightformer intensity={1} position={[6, -2, 1]} rotation-y={-Math.PI / 2} scale={[14, 3, 1]} color="#f3e6d2" />
        </Environment>

        <Starfield />

        {/* cua.ai-style depth: crisp plane near the hero caps, everything
            closer or farther melts away. */}
        <EffectComposer enableNormalPass={false} multisampling={4}>
          <DepthOfField worldFocusDistance={13} worldFocusRange={4.5} bokehScale={5.5} />
        </EffectComposer>

        <Field geometry={geometry} speckleMap={speckleMap} />
      </Canvas>
    </div>
  );
}
