import type {
  BlockCategory,
  BlockShape,
  BlockType,
  BlockTypeSpec,
  GridPosition,
  BrickData,
  BrickColor,
  BrickColorSpec,
  Rotation,
  StudLayout,
} from "@/types/bricks";

export const GRID_SIZE_OPTIONS = [32, 48, 64, 80] as const;
export const DEFAULT_GRID_SIZE = 64;
export const MIN_GRID_SIZE = 8;
export const MAX_GRID_SIZE = 128;
/** Tinggi satu plate dalam satuan grid. Brick = 3 plate = 1.2 (rasio 9.6mm : 8mm). */
export const PLATE_HEIGHT = 0.4;
export const BRICK_GAP = 0.04;
export const STUD_RADIUS = 0.3;
export const STUD_HEIGHT = 0.2;

const brick = (w: number, d: number): BlockTypeSpec => ({
  label: `Brick ${w}x${d}`,
  category: "brick",
  shape: "box",
  width: w,
  depth: d,
  height: 3,
  studs: true,
});

const plate = (w: number, d: number): BlockTypeSpec => ({
  label: `Plate ${w}x${d}`,
  category: "plate",
  shape: "box",
  width: w,
  depth: d,
  height: 1,
  studs: true,
});

const tile = (w: number, d: number): BlockTypeSpec => ({
  label: `Tile ${w}x${d}`,
  category: "tile",
  shape: "box",
  width: w,
  depth: d,
  height: 1,
  studs: false,
});

/** Slope 45°: `length` = arah kemiringan, `width` = lebar stud. */
const slope = (length: number, width: number): BlockTypeSpec => ({
  label: `Slope ${length}x${width}`,
  category: "slope",
  shape: "slope",
  width,
  depth: length,
  height: 3,
  studs: true,
  studLayout: "back",
});

const invSlope = (length: number, width: number): BlockTypeSpec => ({
  label: `Inv Slope ${length}x${width}`,
  pickerLabel: `Inv ${length}×${width}`,
  category: "slope",
  shape: "slope-inv",
  width,
  depth: length,
  height: 3,
  studs: true,
  studLayout: "full",
});

const arch = (length: number): BlockTypeSpec => ({
  label: `Arch 1x${length}`,
  category: "arch",
  shape: "arch",
  width: 1,
  depth: length,
  height: 3,
  studs: true,
});

export const BLOCK_TYPES: Record<Exclude<BlockType, "custom">, BlockTypeSpec> = {
  "brick-1x1": brick(1, 1),
  "brick-1x2": brick(1, 2),
  "brick-1x3": brick(1, 3),
  "brick-1x4": brick(1, 4),
  "brick-1x6": brick(1, 6),
  "brick-1x8": brick(1, 8),
  "brick-1x10": brick(1, 10),
  "brick-1x12": brick(1, 12),
  "brick-1x16": brick(1, 16),
  "brick-2x2": brick(2, 2),
  "brick-2x2x2": {
    ...brick(2, 2),
    label: "Brick 2x2x2",
    pickerLabel: "2×2×2",
    height: 6,
  },
  "brick-2x3": brick(2, 3),
  "brick-2x4": brick(2, 4),
  "brick-2x6": brick(2, 6),
  "brick-2x8": brick(2, 8),
  "brick-2x10": brick(2, 10),
  "brick-2x12": brick(2, 12),
  "brick-2x16": brick(2, 16),
  "brick-4x4": brick(4, 4),
  "brick-4x6": brick(4, 6),
  "brick-4x8": brick(4, 8),
  "plate-1x1": plate(1, 1),
  "plate-1x2": plate(1, 2),
  "plate-1x3": plate(1, 3),
  "plate-1x4": plate(1, 4),
  "plate-1x6": plate(1, 6),
  "plate-1x8": plate(1, 8),
  "plate-1x10": plate(1, 10),
  "plate-1x12": plate(1, 12),
  "plate-2x2": plate(2, 2),
  "plate-2x3": plate(2, 3),
  "plate-2x4": plate(2, 4),
  "plate-2x6": plate(2, 6),
  "plate-2x8": plate(2, 8),
  "plate-2x10": plate(2, 10),
  "plate-2x12": plate(2, 12),
  "plate-2x16": plate(2, 16),
  "plate-4x4": plate(4, 4),
  "plate-4x6": plate(4, 6),
  "plate-4x8": plate(4, 8),
  "plate-4x10": plate(4, 10),
  "plate-4x12": plate(4, 12),
  "plate-6x6": plate(6, 6),
  "plate-6x8": plate(6, 8),
  "plate-8x8": plate(8, 8),
  "jumper-1x2": {
    label: "Jumper 1x2",
    pickerLabel: "Jump",
    category: "plate",
    shape: "box",
    width: 1,
    depth: 2,
    height: 1,
    studs: true,
    studLayout: "center",
  },
  "tile-1x1": tile(1, 1),
  "tile-1x2": tile(1, 2),
  "tile-1x3": tile(1, 3),
  "tile-1x4": tile(1, 4),
  "tile-1x6": tile(1, 6),
  "tile-1x8": tile(1, 8),
  "tile-2x2": tile(2, 2),
  "tile-2x3": tile(2, 3),
  "tile-2x4": tile(2, 4),
  "tile-2x6": tile(2, 6),
  "tile-2x8": tile(2, 8),
  "tile-4x4": tile(4, 4),
  "tile-6x6": tile(6, 6),
  "tile-1x1-round": {
    label: "Round Tile 1x1",
    category: "tile",
    shape: "round",
    width: 1,
    depth: 1,
    height: 1,
    studs: false,
  },
  "tile-2x2-round": {
    label: "Round Tile 2x2",
    category: "tile",
    shape: "round",
    width: 2,
    depth: 2,
    height: 1,
    studs: false,
  },
  "grill-1x2": {
    label: "Grill 1x2",
    pickerLabel: "Grill",
    category: "tile",
    shape: "grill",
    width: 1,
    depth: 2,
    height: 1,
    studs: false,
  },
  "slope-2x1": slope(2, 1),
  "slope-2x2": slope(2, 2),
  "slope-2x3": slope(2, 3),
  "slope-2x4": slope(2, 4),
  "slope-3x1": slope(3, 1),
  "slope-3x2": slope(3, 2),
  "slope-3x4": slope(3, 4),
  "slope-4x1": slope(4, 1),
  "slope-4x2": slope(4, 2),
  "cheese-1x1": {
    label: "Cheese 1x1",
    pickerLabel: "Ch 1×1",
    category: "slope",
    shape: "slope",
    width: 1,
    depth: 1,
    height: 1,
    studs: false,
  },
  "cheese-2x1": {
    label: "Cheese 2x1",
    pickerLabel: "Ch 2×1",
    category: "slope",
    shape: "slope",
    width: 1,
    depth: 2,
    height: 1,
    studs: false,
  },
  "invslope-2x1": invSlope(2, 1),
  "invslope-2x2": invSlope(2, 2),
  "invslope-2x3": invSlope(2, 3),
  "invslope-2x4": invSlope(2, 4),
  "invslope-3x1": invSlope(3, 1),
  "invslope-3x2": invSlope(3, 2),
  "invslope-3x4": invSlope(3, 4),
  "round-1x1": {
    label: "Round 1x1",
    category: "round",
    shape: "round",
    width: 1,
    depth: 1,
    height: 3,
    studs: true,
  },
  "round-2x2": {
    label: "Round 2x2",
    category: "round",
    shape: "round",
    width: 2,
    depth: 2,
    height: 3,
    studs: true,
  },
  "round-4x4": {
    label: "Round 4x4",
    category: "round",
    shape: "round",
    width: 4,
    depth: 4,
    height: 3,
    studs: true,
    studLayout: "center-2x2",
  },
  "round-plate-1x1": {
    label: "Round Plate 1x1",
    pickerLabel: "P1×1",
    category: "round",
    shape: "round",
    width: 1,
    depth: 1,
    height: 1,
    studs: true,
  },
  "round-plate-2x2": {
    label: "Round Plate 2x2",
    pickerLabel: "P2×2",
    category: "round",
    shape: "round",
    width: 2,
    depth: 2,
    height: 1,
    studs: true,
    studLayout: "center",
  },
  "round-plate-4x4": {
    label: "Round Plate 4x4",
    pickerLabel: "P4×4",
    category: "round",
    shape: "round",
    width: 4,
    depth: 4,
    height: 1,
    studs: true,
    studLayout: "center-2x2",
  },
  "cone-1x1": {
    label: "Cone 1x1",
    pickerLabel: "C1×1",
    category: "round",
    shape: "cone",
    width: 1,
    depth: 1,
    height: 3,
    studs: true,
    studLayout: "center",
  },
  "cone-2x2": {
    label: "Cone 2x2x2",
    pickerLabel: "C2×2",
    category: "round",
    shape: "cone",
    width: 2,
    depth: 2,
    height: 6,
    studs: true,
    studLayout: "center",
  },
  "dish-2x2": {
    label: "Dish 2x2",
    pickerLabel: "Dish",
    category: "round",
    shape: "dish",
    width: 2,
    depth: 2,
    height: 1,
    studs: true,
    studLayout: "center",
  },
  "arch-1x3": arch(3),
  "arch-1x4": arch(4),
  "arch-1x6": arch(6),
  "arch-1x8": arch(8),
};

export const BLOCK_CATEGORIES: Record<BlockCategory, { label: string; description: string }> = {
  brick: { label: "Brick", description: "Balok standar, termasuk 2x2x2" },
  plate: { label: "Plate", description: "Pelat tipis dan jumper 1x2" },
  tile: { label: "Tile", description: "Pelat halus, round tile, dan grill" },
  slope: { label: "Slope", description: "Atap 45°, cheese, dan inverted slope" },
  round: { label: "Round", description: "Silinder, cone, plate bulat, dan dish" },
  arch: { label: "Arch", description: "Lengkungan 1×N untuk jendela dan jembatan" },
  custom: { label: "Custom", description: "Buat komponen sendiri: ukuran, bentuk, tinggi, studs" },
};

export const BRICK_COLORS: Record<BrickColor, BrickColorSpec> = {
  white: { label: "Putih", hex: "#f4f4f4" },
  black: { label: "Hitam", hex: "#1b1b1b" },
  gray: { label: "Abu Muda", hex: "#a0a5a9" },
  darkGray: { label: "Abu Tua", hex: "#6d6e6c" },
  red: { label: "Merah", hex: "#d01012" },
  darkRed: { label: "Merah Tua", hex: "#720e0f" },
  coral: { label: "Koral", hex: "#ff698f" },
  pink: { label: "Pink", hex: "#fc97ac" },
  darkPink: { label: "Pink Tua", hex: "#c870a0" },
  magenta: { label: "Magenta", hex: "#923978" },
  orange: { label: "Oranye", hex: "#fe8a18" },
  darkOrange: { label: "Oranye Tua", hex: "#a95500" },
  brightLightOrange: { label: "Oranye Muda", hex: "#f8bb3d" },
  yellow: { label: "Kuning", hex: "#f2cd37" },
  brightLightYellow: { label: "Kuning Muda", hex: "#fff03a" },
  lime: { label: "Lime", hex: "#b4d335" },
  olive: { label: "Zaitun", hex: "#9b9a5a" },
  brightGreen: { label: "Hijau Cerah", hex: "#4b9f4a" },
  green: { label: "Hijau", hex: "#237841" },
  darkGreen: { label: "Hijau Tua", hex: "#184632" },
  sandGreen: { label: "Hijau Pasir", hex: "#a0bcac" },
  brightLightBlue: { label: "Biru Langit", hex: "#9fc3e9" },
  lightBlue: { label: "Biru Muda", hex: "#5a93db" },
  blue: { label: "Biru", hex: "#0055bf" },
  darkBlue: { label: "Biru Tua", hex: "#0a3463" },
  mediumAzure: { label: "Azure", hex: "#36aebf" },
  darkAzure: { label: "Azure Tua", hex: "#078bc9" },
  teal: { label: "Teal", hex: "#008f9b" },
  sandBlue: { label: "Biru Pasir", hex: "#6074a1" },
  lavender: { label: "Lavender", hex: "#e1d5ed" },
  violet: { label: "Violet", hex: "#441a91" },
  purple: { label: "Ungu", hex: "#81007b" },
  tan: { label: "Krem", hex: "#e4cd9e" },
  darkTan: { label: "Krem Tua", hex: "#958a73" },
  brown: { label: "Cokelat", hex: "#583927" },
  darkBrown: { label: "Cokelat Tua", hex: "#352100" },
  lightNougat: { label: "Nougat Muda", hex: "#f6d7b3" },
  nougat: { label: "Nougat", hex: "#cc8e69" },
  mediumNougat: { label: "Nougat Sedang", hex: "#aa7d55" },
  pearlGold: { label: "Emas", hex: "#aa7f2e" },
  pearlSilver: { label: "Perak", hex: "#8a8d8f" },
};

export const BLOCK_TYPE_KEYS = Object.keys(BLOCK_TYPES) as Exclude<BlockType, "custom">[];
export const BLOCK_CATEGORY_KEYS = Object.keys(BLOCK_CATEGORIES) as BlockCategory[];
export const BRICK_COLOR_KEYS = Object.keys(BRICK_COLORS) as BrickColor[];

export const CUSTOM_WIDTH_MAX = 16;
export const CUSTOM_HEIGHT_MAX = 12;

export const CUSTOM_SHAPE_PRESETS: {
  id: string;
  label: string;
  shape: BlockShape;
  height: number;
  studs: boolean;
  studLayout?: StudLayout;
}[] = [
  { id: "brick", label: "Brick", shape: "box", height: 3, studs: true, studLayout: "full" },
  { id: "plate", label: "Plate", shape: "box", height: 1, studs: true, studLayout: "full" },
  { id: "tile", label: "Tile", shape: "box", height: 1, studs: false },
  { id: "slope", label: "Slope", shape: "slope", height: 3, studs: true, studLayout: "back" },
  { id: "inv", label: "Inv", shape: "slope-inv", height: 3, studs: true, studLayout: "full" },
  { id: "round", label: "Round", shape: "round", height: 3, studs: true, studLayout: "full" },
  { id: "cone", label: "Cone", shape: "cone", height: 3, studs: true, studLayout: "center" },
  { id: "arch", label: "Arch", shape: "arch", height: 3, studs: true, studLayout: "full" },
  { id: "dish", label: "Dish", shape: "dish", height: 1, studs: true, studLayout: "center" },
  { id: "grill", label: "Grill", shape: "grill", height: 1, studs: false },
];

function shapeTitle(spec: Pick<BlockTypeSpec, "shape" | "studs" | "height">): string {
  if (spec.shape === "box") {
    if (!spec.studs && spec.height <= 1) return "Tile";
    if (spec.studs && spec.height === 1) return "Plate";
    return "Brick";
  }
  const names: Record<BlockShape, string> = {
    box: "Brick",
    round: "Round",
    slope: "Slope",
    "slope-inv": "Inv Slope",
    cone: "Cone",
    arch: "Arch",
    dish: "Dish",
    grill: "Grill",
  };
  return names[spec.shape];
}

export function formatCustomLabel(spec: Pick<BlockTypeSpec, "shape" | "studs" | "width" | "depth" | "height">): string {
  return `Custom ${shapeTitle(spec)} ${spec.width}×${spec.depth} · ${spec.height}p`;
}

/** Nama part untuk UI manusia: tanpa prefix Custom, ukuran pakai ×. */
export function displayPartName(spec: BlockTypeSpec): string {
  let name = spec.label.replace(/^Custom\s+/i, "").replace(/\s*·\s*\d+p$/i, "").trim();
  name = name.replace(/(\d)x(?=\d)/gi, "$1×");
  const replacements: [RegExp, string][] = [
    [/^Round Tile\s+/i, "Tile bulat "],
    [/^Round Plate\s+/i, "Pelat bulat "],
    [/^Inv Slope\s+/i, "Slope terbalik "],
    [/^Brick\s+/i, "Blok "],
    [/^Plate\s+/i, "Pelat "],
    [/^Jumper\s+/i, "Jumper "],
    [/^Tile\s+/i, "Tile "],
    [/^Cheese\s+/i, "Cheese "],
    [/^Grill\s+/i, "Grill "],
    [/^Slope\s+/i, "Slope "],
    [/^Arch\s+/i, "Lengkung "],
    [/^Dish\s+/i, "Dish "],
    [/^Cone\s+/i, "Kerucut "],
    [/^Round\s+/i, "Bulat "],
  ];
  for (const [pattern, label] of replacements) {
    if (pattern.test(name)) {
      name = name.replace(pattern, label);
      break;
    }
  }
  return name.replace(/\s+/g, " ").trim();
}

export function normalizeCustomSpec(input: Partial<BlockTypeSpec> & Pick<BlockTypeSpec, "shape">): BlockTypeSpec {
  const square = input.shape === "round" || input.shape === "cone" || input.shape === "dish";
  let width = clamp(Math.round(input.width ?? 2), 1, CUSTOM_WIDTH_MAX);
  let depth = clamp(Math.round(input.depth ?? 4), 1, CUSTOM_WIDTH_MAX);
  let height = clamp(Math.round(input.height ?? 3), 1, CUSTOM_HEIGHT_MAX);
  if (square) depth = width;
  if (input.shape === "arch") {
    width = clamp(width, 1, 4);
    depth = Math.max(3, depth);
  }
  const studs = input.studs ?? true;
  const spec: BlockTypeSpec = {
    category: "custom",
    shape: input.shape,
    width,
    depth,
    height,
    studs,
    studLayout: studs ? (input.studLayout ?? (input.shape === "slope" ? "back" : input.shape === "cone" || input.shape === "dish" ? "center" : "full")) : undefined,
    label: "",
  };
  spec.label = formatCustomLabel(spec);
  spec.pickerLabel = `${spec.width}×${spec.depth}`;
  return spec;
}

export const DEFAULT_CUSTOM_SPEC = normalizeCustomSpec({
  shape: "box",
  width: 2,
  depth: 4,
  height: 3,
  studs: true,
  studLayout: "full",
});

export function getBlockSpec(block: Pick<BrickData, "type" | "custom">): BlockTypeSpec {
  if (block.type === "custom") return block.custom ?? DEFAULT_CUSTOM_SPEC;
  return BLOCK_TYPES[block.type];
}

export function getActiveSpec(type: BlockType, customSpec: BlockTypeSpec): BlockTypeSpec {
  return type === "custom" ? customSpec : BLOCK_TYPES[type];
}

export function specFingerprint(spec: BlockTypeSpec): string {
  return `${spec.shape}:${spec.width}x${spec.depth}x${spec.height}:${spec.studs ? spec.studLayout ?? "full" : "none"}`;
}

/** Ukuran footprint [lebar (x), panjang (z)] setelah rotasi. */
export function footprintOf(spec: BlockTypeSpec, rotation: Rotation): [number, number] {
  return rotation === 90 ? [spec.depth, spec.width] : [spec.width, spec.depth];
}

export function getFootprint(type: BlockType, rotation: Rotation, custom?: BlockTypeSpec): [number, number] {
  return footprintOf(getActiveSpec(type, custom ?? DEFAULT_CUSTOM_SPEC), rotation);
}

export function isSpecRotatable(spec: BlockTypeSpec): boolean {
  return spec.width !== spec.depth;
}

export function isRotatable(type: BlockType, custom?: BlockTypeSpec): boolean {
  return isSpecRotatable(getActiveSpec(type, custom ?? DEFAULT_CUSTOM_SPEC));
}

function resolveStudLayout(spec: BlockTypeSpec): StudLayout {
  if (!spec.studs) return "full";
  if (spec.studLayout) return spec.studLayout;
  if (spec.shape === "slope") return "back";
  if (spec.shape === "cone" || spec.shape === "dish") return "center";
  return "full";
}

/** Offset stud [x, z] di ruang lokal blok (pusat di 0,0). */
export function getStudOffsets(spec: BlockTypeSpec): [number, number][] {
  if (!spec.studs) return [];
  const layout = resolveStudLayout(spec);
  if (layout === "center") return [[0, 0]];
  if (layout === "center-2x2") {
    return [
      [-0.5, -0.5],
      [0.5, -0.5],
      [-0.5, 0.5],
      [0.5, 0.5],
    ];
  }
  if (layout === "back") {
    const offsets: [number, number][] = [];
    for (let i = 0; i < spec.width; i++) {
      offsets.push([-spec.width / 2 + 0.5 + i, spec.depth / 2 - 0.5]);
    }
    return offsets;
  }
  const offsets: [number, number][] = [];
  for (let i = 0; i < spec.width; i++) {
    for (let j = 0; j < spec.depth; j++) {
      offsets.push([-spec.width / 2 + 0.5 + i, -spec.depth / 2 + 0.5 + j]);
    }
  }
  return offsets;
}

export function getStudCount(spec: BlockTypeSpec): number {
  if (!spec.studs) return 0;
  return getStudOffsets(spec).length;
}

const cellKey = (x: number, z: number) => `${x},${z}`;

/** Peta tinggi: untuk tiap sel (x,z), level plate kosong terendah di atas tumpukan. */
export function buildHeightMap(blocks: BrickData[]): Map<string, number> {
  const heights = new Map<string, number>();
  for (const block of blocks) {
    const spec = getBlockSpec(block);
    const [w, d] = footprintOf(spec, block.rotation);
    const top = block.position[1] + spec.height;
    const [bx, , bz] = block.position;
    for (let x = bx; x < bx + w; x++) {
      for (let z = bz; z < bz + d; z++) {
        const key = cellKey(x, z);
        heights.set(key, Math.max(heights.get(key) ?? 0, top));
      }
    }
  }
  return heights;
}

/**
 * Snap titik dunia (x,z) ke grid: blok dipusatkan di bawah kursor, dibatasi
 * di dalam landasan, lalu ditumpuk di atas blok tertinggi pada footprint-nya.
 */
export function computePlacement(
  heightMap: Map<string, number>,
  type: BlockType,
  rotation: Rotation,
  gridSize: number,
  worldX: number,
  worldZ: number,
  custom?: BlockTypeSpec,
): GridPosition {
  const [w, d] = getFootprint(type, rotation, custom);
  const half = gridSize / 2;
  const x0 = clamp(Math.round(worldX - w / 2), -half, half - w);
  const z0 = clamp(Math.round(worldZ - d / 2), -half, half - d);

  let level = 0;
  for (let x = x0; x < x0 + w; x++) {
    for (let z = z0; z < z0 + d; z++) {
      level = Math.max(level, heightMap.get(cellKey(x, z)) ?? 0);
    }
  }
  return [x0, level, z0];
}

/** Genapkan dan batasi ukuran landasan ke rentang yang aman untuk kanvas. */
export function normalizeGridSize(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_GRID_SIZE;
  const even = Math.round(value / 2) * 2;
  return clamp(even, MIN_GRID_SIZE, MAX_GRID_SIZE);
}

/** Apakah semua blok masih muat di landasan berukuran `gridSize`. */
export function blocksFitGrid(blocks: BrickData[], gridSize: number): boolean {
  const half = gridSize / 2;
  return blocks.every((block) => {
    const [w, d] = footprintOf(getBlockSpec(block), block.rotation);
    const [x, , z] = block.position;
    return x >= -half && z >= -half && x + w <= half && z + d <= half;
  });
}

export function createBlockId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
