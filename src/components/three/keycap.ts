import * as THREE from "three";

/**
 * Procedural ceramic keycap: rounded-square profile, extruded with a bevel,
 * then tapered toward the top face — the classic OEM keycap silhouette.
 * Slightly chunkier than v1 to match cua.ai's capsule-like caps.
 */
export function buildKeycapGeometry({
  size = 2,
  depth = 1.15,
  // Strong taper — cua.ai's caps read unmistakably as keycaps, not cubes.
  topScale = 0.55,
  radius = 0.3,
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

  // Broad tonal blotches first, like real unglazed ceramic — kept very soft
  // and low-contrast so they read as clay shading, not crackle glaze.
  const blotches = ["#ddd2bd", "#e7dfd0", "#d5c8b3"];
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = blotches[Math.floor(rand() * blotches.length)] ?? "#ddd2bd";
    ctx.globalAlpha = 0.06 + rand() * 0.08;
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, 30 + rand() * 60, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine speckles — sized so they survive being squeezed into ~200 screen
  // pixels on the real page (a 512px texture maps to less than half its
  // resolution, so anything under ~1 texel-pixel vanishes).
  const colors = ["#6d604e", "#8a7c66", "#574e40", "#a89a82", "#3f3a30"];
  for (let i = 0; i < 1600; i++) {
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)] ?? "#6d604e";
    ctx.globalAlpha = 0.55 + rand() * 0.4;
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, 0.9 + rand() * 2.1, 0, Math.PI * 2);
    ctx.fill();
  }
  // A sprinkle of dark grit dots — the cua.ai pepper.
  for (let i = 0; i < 220; i++) {
    ctx.fillStyle = "#332e26";
    ctx.globalAlpha = 0.6 + rand() * 0.35;
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, 1.2 + rand() * 1.8, 0, Math.PI * 2);
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
