import { displayPartName, footprintOf, getBlockSpec, specFingerprint } from "@/lib/bricks";
import type { BlockType, BrickData, BrickColor } from "@/types/bricks";

const MAX_PIECES_PER_STEP = 3;

export interface BuildPart {
  type: BlockType;
  color: BrickColor;
  count: number;
  label: string;
}

export interface BuildStep {
  number: number;
  title: string;
  description: string;
  blockIds: string[];
  parts: BuildPart[];
  /** 0 = landasan, lalu 1, 2, … per ketinggian brick. */
  layer: number;
}

function cellKey(x: number, z: number) {
  return `${x},${z}`;
}

function footprintCells(block: BrickData) {
  const [w, d] = footprintOf(getBlockSpec(block), block.rotation);
  const [x, level, z] = block.position;
  const cells: { x: number; z: number; level: number }[] = [];
  for (let ix = x; ix < x + w; ix++) {
    for (let iz = z; iz < z + d; iz++) {
      cells.push({ x: ix, z: iz, level });
    }
  }
  return cells;
}

function canPlace(block: BrickData, heights: Map<string, number>) {
  return footprintCells(block).every((cell) => (heights.get(cellKey(cell.x, cell.z)) ?? 0) === cell.level);
}

function sortReady(a: BrickData, b: BrickData) {
  const specA = getBlockSpec(a);
  const specB = getBlockSpec(b);
  const areaA = specA.width * specA.depth * specA.height;
  const areaB = specB.width * specB.depth * specB.height;
  return (
    a.position[1] - b.position[1] ||
    areaB - areaA ||
    a.position[2] - b.position[2] ||
    a.position[0] - b.position[0]
  );
}

function partsFrom(blocks: BrickData[]): BuildPart[] {
  const map = new Map<string, BuildPart>();
  for (const block of blocks) {
    const spec = getBlockSpec(block);
    const key = `${specFingerprint(spec)}:${block.color}`;
    const current = map.get(key);
    if (current) current.count += 1;
    else map.set(key, { type: block.type, color: block.color, count: 1, label: displayPartName(spec) });
  }
  return [...map.values()];
}

function describeStep(_number: number, picked: BrickData[]): { title: string; description: string; layer: number } {
  if (picked.length === 0) {
    return {
      title: "Landasan",
      description: "Papan masih polos. Semua langkah berikutnya naik dari sini.",
      layer: 0,
    };
  }

  const parts = partsFrom(picked);
  const layer = Math.floor(picked[0].position[1] / 3) + 1;
  const spec = getBlockSpec(picked[0]);
  const name = displayPartName(spec);
  const title =
    parts.length === 1
      ? parts[0].count > 1
        ? `${parts[0].count}× ${name}`
        : name
      : `${picked.length} part`;

  const description =
    layer === 1
      ? parts[0].count > 1
        ? "Jejer di atas papan, jangan ditumpuk dulu."
        : "Taruh langsung di atas papan."
      : "Tumpuk di atas yang sudah terpasang.";

  return { title, description, layer };
}

function pickGroup(ready: BrickData[]) {
  const lowest = ready[0].position[1];
  const sameLevel = ready.filter((block) => block.position[1] === lowest);
  const lead = sameLevel[0];
  const leadKey = specFingerprint(getBlockSpec(lead));
  const matching = sameLevel.filter(
    (block) => specFingerprint(getBlockSpec(block)) === leadKey && block.color === lead.color,
  );
  return matching.slice(0, MAX_PIECES_PER_STEP);
}

/**
 * Menyusun urutan pemasangan: landasan dulu, lalu blok yang sudah punya tumpuan,
 * dari bawah ke atas seperti buku instruksi.
 */
export function generateBuildSteps(blocks: BrickData[]): BuildStep[] {
  const remaining = new Map(blocks.map((block) => [block.id, block]));
  const heights = new Map<string, number>();
  const assembled: BrickData[][] = [[]];

  while (remaining.size > 0) {
    const ready = [...remaining.values()].filter((block) => canPlace(block, heights)).sort(sortReady);
    const picked =
      ready.length > 0 ? pickGroup(ready) : [[...remaining.values()].sort(sortReady)[0]].filter(Boolean);

    if (picked.length === 0) break;
    assembled.push(picked);
    for (const block of picked) {
      remaining.delete(block.id);
      const top = block.position[1] + getBlockSpec(block).height;
      for (const cell of footprintCells(block)) {
        heights.set(cellKey(cell.x, cell.z), top);
      }
    }
  }

  return assembled.map((group, index) => {
    const number = index + 1;
    const { title, description, layer } = describeStep(number, group);
    return {
      number,
      title,
      description,
      blockIds: group.map((block) => block.id),
      parts: partsFrom(group),
      layer,
    };
  });
}

export function layerHeading(layer: number): string {
  if (layer === 0) return "Halaman awal";
  if (layer === 1) return "Dasar";
  if (layer === 2) return "Tingkat dua";
  return `Tingkat ${layer}`;
}

export function groupStepsByLayer(steps: BuildStep[]): { layer: number; heading: string; steps: BuildStep[] }[] {
  const groups: { layer: number; heading: string; steps: BuildStep[] }[] = [];
  for (const step of steps) {
    const last = groups[groups.length - 1];
    if (!last || last.layer !== step.layer) {
      groups.push({ layer: step.layer, heading: layerHeading(step.layer), steps: [step] });
    } else {
      last.steps.push(step);
    }
  }
  return groups;
}

export function visibleIdsThrough(steps: BuildStep[], index: number) {
  const ids = new Set<string>();
  for (let i = 0; i <= index; i++) {
    for (const id of steps[i]?.blockIds ?? []) ids.add(id);
  }
  return ids;
}
