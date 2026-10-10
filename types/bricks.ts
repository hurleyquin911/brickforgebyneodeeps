export type BlockCategory = "brick" | "plate" | "tile" | "slope" | "round" | "arch" | "custom";

export type BlockShape = "box" | "round" | "slope" | "slope-inv" | "cone" | "arch" | "dish" | "grill";

export type StudLayout = "full" | "back" | "center" | "center-2x2";

export type BlockType =
  | "brick-1x1"
  | "brick-1x2"
  | "brick-1x3"
  | "brick-1x4"
  | "brick-1x6"
  | "brick-1x8"
  | "brick-1x10"
  | "brick-1x12"
  | "brick-1x16"
  | "brick-2x2"
  | "brick-2x2x2"
  | "brick-2x3"
  | "brick-2x4"
  | "brick-2x6"
  | "brick-2x8"
  | "brick-2x10"
  | "brick-2x12"
  | "brick-2x16"
  | "brick-4x4"
  | "brick-4x6"
  | "brick-4x8"
  | "plate-1x1"
  | "plate-1x2"
  | "plate-1x3"
  | "plate-1x4"
  | "plate-1x6"
  | "plate-1x8"
  | "plate-1x10"
  | "plate-1x12"
  | "plate-2x2"
  | "plate-2x3"
  | "plate-2x4"
  | "plate-2x6"
  | "plate-2x8"
  | "plate-2x10"
  | "plate-2x12"
  | "plate-2x16"
  | "plate-4x4"
  | "plate-4x6"
  | "plate-4x8"
  | "plate-4x10"
  | "plate-4x12"
  | "plate-6x6"
  | "plate-6x8"
  | "plate-8x8"
  | "jumper-1x2"
  | "tile-1x1"
  | "tile-1x2"
  | "tile-1x3"
  | "tile-1x4"
  | "tile-1x6"
  | "tile-1x8"
  | "tile-2x2"
  | "tile-2x3"
  | "tile-2x4"
  | "tile-2x6"
  | "tile-2x8"
  | "tile-4x4"
  | "tile-6x6"
  | "tile-1x1-round"
  | "tile-2x2-round"
  | "grill-1x2"
  | "slope-2x1"
  | "slope-2x2"
  | "slope-2x3"
  | "slope-2x4"
  | "slope-3x1"
  | "slope-3x2"
  | "slope-3x4"
  | "slope-4x1"
  | "slope-4x2"
  | "cheese-1x1"
  | "cheese-2x1"
  | "invslope-2x1"
  | "invslope-2x2"
  | "invslope-2x3"
  | "invslope-2x4"
  | "invslope-3x1"
  | "invslope-3x2"
  | "invslope-3x4"
  | "round-1x1"
  | "round-2x2"
  | "round-4x4"
  | "round-plate-1x1"
  | "round-plate-2x2"
  | "round-plate-4x4"
  | "cone-1x1"
  | "cone-2x2"
  | "dish-2x2"
  | "arch-1x3"
  | "arch-1x4"
  | "arch-1x6"
  | "arch-1x8"
  | "custom";

export type BrickColor =
  | "white"
  | "black"
  | "gray"
  | "darkGray"
  | "red"
  | "darkRed"
  | "coral"
  | "pink"
  | "darkPink"
  | "magenta"
  | "orange"
  | "darkOrange"
  | "brightLightOrange"
  | "yellow"
  | "brightLightYellow"
  | "lime"
  | "olive"
  | "brightGreen"
  | "green"
  | "darkGreen"
  | "sandGreen"
  | "brightLightBlue"
  | "lightBlue"
  | "blue"
  | "darkBlue"
  | "mediumAzure"
  | "darkAzure"
  | "teal"
  | "sandBlue"
  | "lavender"
  | "violet"
  | "purple"
  | "tan"
  | "darkTan"
  | "brown"
  | "darkBrown"
  | "lightNougat"
  | "nougat"
  | "mediumNougat"
  | "pearlGold"
  | "pearlSilver";

/** Rotasi blok di sumbu Y (derajat). 90 menukar lebar dan panjang blok. */
export type Rotation = 0 | 90;

/**
 * Posisi dalam satuan grid: [x, level, z].
 * x/z = sel pojok minimum, level = tinggi dasar blok dalam satuan plate (1 brick = 3 plate).
 */
export type GridPosition = [number, number, number];

export type BuilderMode = "build" | "select";

export interface BrickData {
  id: string;
  position: GridPosition;
  color: BrickColor;
  type: BlockType;
  rotation: Rotation;
  /** Spesifikasi komponen buatan pengguna jika `type === "custom"`. */
  custom?: BlockTypeSpec;
}

export interface BlockTypeSpec {
  label: string;
  category: BlockCategory;
  shape: BlockShape;
  width: number;
  depth: number;
  /** Tinggi dalam satuan plate. */
  height: number;
  studs: boolean;
  /** Label pendek di picker; default `width×depth`. */
  pickerLabel?: string;
  studLayout?: StudLayout;
}

export interface BrickColorSpec {
  label: string;
  hex: string;
}
