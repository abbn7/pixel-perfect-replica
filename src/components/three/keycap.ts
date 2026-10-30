import * as THREE from "three";

export type SymbolKind = "leaf" | "code";

/*
 * Procedural ceramic keycap like the reference renders: a large flat
 * rounded-square top with a crisp, brightly-lit bevel rim, and sides that
 * slope outward toward a wider base. The taper is eased so the wall reads
 * as a straight truncated pyramid with a soft shoulder — not a pillow.
 */
export function buildKeycapGeometry({
  size = 2,
  depth = 0.95,
  topScale = 0.72,
  radius = 0.48,
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

  const bevelSize = 0.2;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.22,
    bevelSize,
    bevelSegments: 8,
    curveSegments: 24,
  });

  // Taper the sides toward the top face. The power easing keeps the base
  // wide and the wall nearly straight, curving in only near the shoulder.
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const zMin = bb.min.z;
  const zMax = bb.max.z;
  const span = Math.max(zMax - zMin, 1e-6);
  const pos = geo.attributes["position"] as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getZ(i) - zMin) / span;
    const s = 1 - (1 - topScale) * Math.pow(t, 1.45);
    pos.setX(i, pos.getX(i) * s);
    pos.setY(i, pos.getY(i) * s);
  }
  pos.needsUpdate = true;

  geo.center();
  geo.computeVertexNormals();
  return geo;
}

const UV_SPAN = 2.4; // lid UVs span roughly ±(half + bevelSize)

function applyFaceUVTransform(tex: THREE.CanvasTexture) {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.repeat.set(1 / UV_SPAN, 1 / UV_SPAN);
  tex.offset.set(0.5, 0.5);
  return tex;
}

/** Speckled glazed ceramic face — warm off-white clay with fine dark grit. */
export function makeSpeckleTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#e8e1d3";
  ctx.fillRect(0, 0, size, size);

  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  // Sparse fine grit, like the reference's peppered glaze. Sized so single
  // speckles stay visible when the 512px map squeezes into ~400 face pixels.
  const colors = ["#5c5245", "#7a6d5b", "#403a30", "#8f8271"];
  for (let i = 0; i < 420; i++) {
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)] ?? "#5c5245";
    ctx.globalAlpha = 0.6 + rand() * 0.35;
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, 0.9 + rand() * 1.7, 0, Math.PI * 2);
    ctx.fill();
  }
  // A few larger flecks.
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = "#3c352b";
    ctx.globalAlpha = 0.55 + rand() * 0.3;
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, 1.8 + rand() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  return applyFaceUVTransform(new THREE.CanvasTexture(canvas));
}

/**
 * Engraved-symbol face texture for the glossy caps. The symbol sits in the
 * canvas center with an engraved shadow so it reads as pressed into the
 * glaze; the bevel ring around it stays the plain cap color.
 */
export function makeSymbolTexture(kind: SymbolKind, base: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.3; // overall symbol height
  const engraved = kind === "code" ? "#f4ecdc" : shade(base, -0.22);

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.42)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 7;
  ctx.fillStyle = engraved;

  if (kind === "code") {
    ctx.strokeStyle = engraved;
    ctx.lineWidth = s * 0.14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const h = s * 0.27;
    const w = s * 0.16;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.36 + w, cy - h);
    ctx.lineTo(cx - s * 0.36, cy);
    ctx.lineTo(cx - s * 0.36 + w, cy + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.36 - w, cy - h);
    ctx.lineTo(cx + s * 0.36, cy);
    ctx.lineTo(cx + s * 0.36 - w, cy + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.07, cy + h);
    ctx.lineTo(cx + s * 0.07, cy - h);
    ctx.stroke();
  } else {
    // Three-leaf sprout: one upright petal flanked by two angled ones.
    const petal = (angle: number, len: number, wdt: number) => {
      ctx.save();
      ctx.translate(cx, cy + s * 0.42);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(wdt, -len / 2, 0, -len);
      ctx.quadraticCurveTo(-wdt, -len / 2, 0, 0);
      ctx.fill();
      ctx.restore();
    };
    petal(0, s, s * 0.26);
    petal(-0.95, s * 0.7, s * 0.2);
    petal(0.95, s * 0.7, s * 0.2);
  }
  ctx.restore();

  return applyFaceUVTransform(new THREE.CanvasTexture(canvas));
}

/** Lighten/darken a hex color by amount (-1..1), keeping it in sRGB. */
function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) =>
    Math.round(Math.min(255, Math.max(0, amount >= 0 ? v + (255 - v) * amount : v * (1 + amount))));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
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
