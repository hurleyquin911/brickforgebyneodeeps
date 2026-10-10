import { createBlockId } from "@/lib/bricks";
import type { BlockType, BrickData, BrickColor, Rotation } from "@/types/bricks";

export interface SharedSet {
  slug: string;
  title: string;
  author: string;
  pieces: number;
  note: string;
  blocks: BrickData[];
}

function build(
  prefix: string,
  parts: Array<[BlockType, BrickColor, number, number, number, Rotation?]>,
): BrickData[] {
  return parts.map(([type, color, x, level, z, rotation], index) => ({
    id: `${prefix}-${index}`,
    type,
    color,
    position: [x, level, z],
    rotation: rotation ?? 0,
  }));
}

const rumah = build("rumah", [
  ["plate-6x6", "green", 0, 0, 0],
  ["plate-1x2", "brown", 2, 0, -1, 90],
  ["brick-1x2", "red", 0, 1, 0, 90],
  ["brick-1x2", "black", 2, 1, 0, 90],
  ["brick-1x2", "red", 4, 1, 0, 90],
  ["brick-1x4", "red", 0, 1, 1],
  ["brick-1x4", "red", 5, 1, 1],
  ["brick-1x6", "red", 0, 1, 5, 90],
  ["brick-1x6", "red", 0, 4, 0, 90],
  ["brick-1x1", "red", 0, 4, 1],
  ["brick-1x2", "lightBlue", 0, 4, 2],
  ["brick-1x1", "red", 0, 4, 4],
  ["brick-1x1", "red", 5, 4, 1],
  ["brick-1x2", "lightBlue", 5, 4, 2],
  ["brick-1x1", "red", 5, 4, 4],
  ["brick-1x6", "red", 0, 4, 5, 90],
  ["slope-4x2", "yellow", 0, 7, 1],
  ["slope-4x2", "yellow", 2, 7, 1],
  ["slope-4x2", "yellow", 4, 7, 1],
  ["brick-1x1", "darkGray", 4, 10, 4],
]);

const menara = build("menara", [
  ["plate-6x8", "lightBlue", 0, 0, 0],
  ["brick-2x8", "brown", 2, 1, 0],
  ["brick-1x1", "darkGray", 2, 4, 1],
  ["brick-1x1", "darkGray", 3, 4, 1],
  ["brick-1x1", "darkGray", 2, 4, 3],
  ["brick-1x1", "darkGray", 3, 4, 3],
  ["brick-2x2", "darkGray", 2, 4, 5],
  ["brick-2x2", "blue", 2, 7, 5],
  ["brick-1x1", "white", 1, 8, 5],
  ["brick-1x1", "white", 4, 8, 6],
  ["brick-2x2", "blue", 2, 10, 5],
  ["brick-2x2", "lightBlue", 2, 13, 5],
  ["cone-2x2", "yellow", 2, 16, 5],
  ["round-plate-1x1", "orange", 2, 22, 5],
  ["round-plate-1x1", "orange", 3, 22, 6],
]);

const perahu = build("perahu", [
  ["plate-8x8", "lightBlue", 0, 0, 0],
  ["slope-2x2", "brown", 3, 1, 0],
  ["brick-2x6", "brown", 3, 1, 2],
  ["plate-2x4", "tan", 3, 4, 3],
  ["brick-2x2", "white", 3, 4, 5],
  ["brick-1x1", "white", 4, 4, 2],
  ["brick-1x1", "white", 4, 7, 2],
  ["plate-1x4", "white", 3, 8, 2],
  ["plate-1x3", "white", 5, 8, 2],
  ["round-plate-1x1", "red", 4, 10, 2],
  ["round-1x1", "green", 5, 4, 4],
]);

const kios = build("kios", [
  ["plate-6x6", "tan", 0, 0, 0],
  ["brick-1x6", "red", 0, 1, 5, 90],
  ["brick-1x4", "red", 0, 1, 1],
  ["brick-1x4", "red", 5, 1, 1],
  ["brick-1x4", "white", 1, 1, 2, 90],
  ["brick-1x1", "red", 0, 4, 0],
  ["brick-1x1", "red", 5, 4, 0],
  ["brick-1x1", "red", 0, 4, 5],
  ["brick-1x1", "red", 5, 4, 5],
  ["slope-4x2", "yellow", 0, 7, 1],
  ["slope-4x2", "yellow", 2, 7, 1],
  ["slope-4x2", "yellow", 4, 7, 1],
  ["round-plate-1x1", "red", 2, 4, 2],
  ["round-plate-1x1", "lime", 3, 4, 2],
  ["round-plate-1x1", "orange", 4, 4, 2],
  ["round-1x1", "green", 1, 4, 3],
]);

export const SHARED_SETS: SharedSet[] = [
  {
    slug: "rumah-jendela",
    title: "Rumah jendela",
    author: "Mira",
    pieces: rumah.length,
    note: "Atap kuning, dua jendela biru, pintu gelap.",
    blocks: rumah,
  },
  {
    slug: "menara-dermaga",
    title: "Menara dermaga",
    author: "Arka",
    pieces: menara.length,
    note: "Dermaga cokelat, badan biru, ujung oranye.",
    blocks: menara,
  },
  {
    slug: "perahu-kecil",
    title: "Perahu kecil",
    author: "Sena",
    pieces: perahu.length,
    note: "Lambung cokelat, layar putih, di air biru.",
    blocks: perahu,
  },
  {
    slug: "kios-sudut",
    title: "Kios sudut",
    author: "Lala",
    pieces: kios.length,
    note: "Tenda kuning di atas blok merah.",
    blocks: kios,
  },
];

export function findSharedSet(slug: string | undefined) {
  if (!slug) return null;
  return SHARED_SETS.find((item) => item.slug === slug) ?? null;
}

/** Salinan susunan galeri dengan id baru, supaya editan di studio tidak mengubah katalog. */
export function copySharedBlocks(blocks: BrickData[]): BrickData[] {
  return blocks.map((block) => ({
    id: createBlockId(),
    type: block.type,
    color: block.color,
    rotation: block.rotation,
    position: [block.position[0], block.position[1], block.position[2]],
    custom: block.custom ? { ...block.custom } : undefined,
  }));
}
