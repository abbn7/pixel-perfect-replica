import * as THREE from "three";

/**
 * Procedural ceramic keycap: rounded-square profile, extruded with a bevel,
 * then tapered toward the top face — the classic OEM keycap silhouette.
 */
export function buildKeycapGeometry({
  size = 2,
  depth = 0.85,
  topScale = 0.78,
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
    bevelThickness: 0.16,
    bevelSize: 0.13,
    bevelSegments: 5,
    curveSegments: 14,
  });

  // Taper sides toward the top face (quadratic easing keeps the base wide).
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const zMin = bb.min.z;
  const zMax = bb.max.z;
  const span = Math.max(zMax - zMin, 1e-6);
  const pos = geo.attributes.position as THREE.BufferAttribute;
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

/** Deterministic speckled ceramic texture for the cream keycaps. */
export function makeSpeckleTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ece7dc";
  ctx.fillRect(0, 0, size, size);

  const colors = ["#8a7a63", "#a89a84", "#6f6250"];
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 320; i++) {
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    ctx.globalAlpha = 0.2 + rand() * 0.3;
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, 0.4 + rand() * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
