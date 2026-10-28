import * as THREE from "three";

/**
 * Procedural ceramic keycap: rounded-square profile, extruded with a bevel,
 * then tapered toward the top face — the classic OEM keycap silhouette.
 * Slightly chunkier than v1 to match cua.ai's capsule-like caps.
 */
export function buildKeycapGeometry({
  size = 2,
  depth = 0.95,
  topScale = 0.82,
  radius = 0.34,
} = {}): THREE.BufferGeometry {
  const half = size / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-half + radius, -half);
  shape.lineTo(half - radius, -half);
  shape.quadraticCurveTo(half, -half, half, -half + radius);
  shape.lineTo(half, half - radius);
  shape.quadraticCurveTo(half, half, half - radius, half);
  shape.lineTo(-half + radius, half);
  shape.quadraticCurveTo(-half, half, -half, half - radius);
  shape.lineTo(-half, -half + radius);
  shape.quadraticCurveTo(-half, -half, -half + radius, -half);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.18,
    bevelSize: 0.15,
    bevelSegments: 6,
    curveSegments: 16,
  });

  // Taper sides toward the top face (quadratic easing keeps the base wide).
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const zMin = bb.min.z;
  const zMax = bb.max.z;
  const span = Math.max(zMax - zMin, 1e-6);
  const pos = geo.attributes["position"] as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getZ(i) - zMin) / span;
    const s = 1 - (1 - topScale) * t * t;
    pos.setX(i, pos.getX(i) * s);
    pos.setY(i, pos.getY(i) * s);
  }
  pos.needsUpdate = true;

  geo.center();
  geo.computeVertexNormals();
  return geo;
}

/** Deterministic speckled ceramic texture — warm beige clay with darker grit. */
export function makeSpeckleTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#e3dbcb";
  ctx.fillRect(0, 0, size, size);

  // Broad tonal blotches first, like real unglazed ceramic.
  const blotches = ["#dccfb9", "#e8e0d1", "#d2c4ae"];
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = blotches[Math.floor(rand() * blotches.length)] ?? "#dccfb9";
    ctx.globalAlpha = 0.25 + rand() * 0.25;
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, 18 + rand() * 55, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine speckles on top.
  const colors = ["#7d6f5a", "#94866e", "#645949", "#a99a83"];
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)] ?? "#7d6f5a";
    ctx.globalAlpha = 0.25 + rand() * 0.45;
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, 0.4 + rand() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Soft round dot sprite for the starfield points. */
export function makeStarTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
