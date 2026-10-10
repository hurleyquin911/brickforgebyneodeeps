import { PLATE_HEIGHT, footprintOf, getBlockSpec } from "@/lib/bricks";
import type { BrickData } from "@/types/bricks";

export const MODEL_VIEWS = [
  { id: "depan", label: "Depan", azimuth: Math.PI, elevation: 0.34 },
  { id: "sisi", label: "Sisi", azimuth: Math.PI / 2, elevation: 0.4 },
  { id: "belakang", label: "Belakang", azimuth: 0, elevation: 0.34 },
  { id: "atas", label: "Atas", azimuth: Math.PI * 0.82, elevation: 1.08 },
] as const;

export interface ModelFrame {
  center: [number, number, number];
  floor: number;
  distance: number;
  span: number;
}

export function frameModel(blocks: BrickData[]): ModelFrame {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  for (const block of blocks) {
    const spec = getBlockSpec(block);
    const [w, d] = footprintOf(spec, block.rotation);
    const [x, level, z] = block.position;
    const y = level * PLATE_HEIGHT;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + w);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z + d);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + spec.height * PLATE_HEIGHT + (spec.studs ? 0.18 : 0));
  }

  const span = Math.max(maxX - minX, maxZ - minZ, (maxY - minY) * 1.15, 2);
  const distance = fitDistance(span, 1);

  return {
    center: [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2],
    floor: minY,
    distance,
    span,
  };
}

/** Jarak kamera supaya karya mengisi bingkai, mengikuti aspek kanvas. */
export function fitDistance(span: number, aspect: number): number {
  const tan = Math.tan((30 * Math.PI) / 180 / 2);
  const pad = 0.92;
  const safeAspect = Math.max(aspect, 0.65);
  const byHeight = (span * pad) / tan;
  const byWidth = (span * pad) / (tan * safeAspect);
  return Math.max(byHeight, byWidth);
}

export function cameraPose(frame: ModelFrame, viewIndex: number, distance = frame.distance): [number, number, number] {
  const view = MODEL_VIEWS[((viewIndex % MODEL_VIEWS.length) + MODEL_VIEWS.length) % MODEL_VIEWS.length];
  const horiz = Math.cos(view.elevation) * distance;
  return [
    frame.center[0] + Math.sin(view.azimuth) * horiz,
    frame.center[1] + Math.sin(view.elevation) * frame.distance,
    frame.center[2] + Math.cos(view.azimuth) * horiz,
  ];
}
