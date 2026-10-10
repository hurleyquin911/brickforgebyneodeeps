import { BufferAttribute, BufferGeometry } from "three";

const cache = new Map<string, BufferGeometry>();

type V = [number, number, number];

function tri(positions: number[], a: V, b: V, c: V) {
  positions.push(...a, ...b, ...c);
}

function quad(positions: number[], a: V, b: V, c: V, d: V) {
  tri(positions, a, b, c);
  tri(positions, a, c, d);
}

/**
 * Slope 45° padat: bibir depan, bidang miring, dan dataran stud di +Z.
 * Sumbu lokal: X lebar, Y tinggi (dasar di 0), Z panjang; tinggi di belakang.
 */
export function getSlopeGeometry(width: number, depth: number, height: number): BufferGeometry {
  const key = `${width.toFixed(3)}:${depth.toFixed(3)}:${height.toFixed(3)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const hw = width / 2;
  const hd = depth / 2;
  const lip = Math.min(0.16, height * 0.28);
  const plateau = height < 0.7 || depth < 1.4 ? 0 : Math.min(1, depth * 0.5);

  const flb: V = [-hw, 0, -hd];
  const frb: V = [hw, 0, -hd];
  const brb: V = [hw, 0, hd];
  const blb: V = [-hw, 0, hd];
  const flt: V = [-hw, lip, -hd];
  const frt: V = [hw, lip, -hd];
  const plt: V = [-hw, height, hd - plateau];
  const prt: V = [hw, height, hd - plateau];
  const blt: V = [-hw, height, hd];
  const brt: V = [hw, height, hd];

  const positions: number[] = [];

  quad(positions, flb, frb, brb, blb);
  quad(positions, flb, flt, frt, frb);
  quad(positions, flt, plt, prt, frt);
  if (plateau > 1e-4) {
    quad(positions, plt, blt, brt, prt);
  }
  quad(positions, blt, blb, brb, brt);
  if (plateau > 1e-4) {
    tri(positions, flb, blb, blt);
    tri(positions, flb, blt, plt);
    tri(positions, flb, plt, flt);
    tri(positions, frb, frt, prt);
    tri(positions, frb, prt, brt);
    tri(positions, frb, brt, brb);
  } else {
    tri(positions, flb, blb, blt);
    tri(positions, flb, blt, flt);
    tri(positions, frb, frt, brt);
    tri(positions, frb, brt, brb);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.computeVertexNormals();

  cache.set(key, geometry);
  return geometry;
}

/**
 * Inverted slope: atap datar penuh di atas, irisan miring di bawah.
 * Studs di seluruh footprint; tinggi di +Z.
 */
export function getInvertedSlopeGeometry(width: number, depth: number, height: number): BufferGeometry {
  const key = `inv:${width.toFixed(3)}:${depth.toFixed(3)}:${height.toFixed(3)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const hw = width / 2;
  const hd = depth / 2;
  const lip = Math.min(0.16, height * 0.22);
  const plateau = depth >= 1.4 ? Math.min(1, depth * 0.5) : 0;

  const flt: V = [-hw, height, -hd];
  const frt: V = [hw, height, -hd];
  const brt: V = [hw, height, hd];
  const blt: V = [-hw, height, hd];
  const flb: V = [-hw, height - lip, -hd];
  const frb: V = [hw, height - lip, -hd];
  const brb: V = [hw, 0, hd];
  const blb: V = [-hw, 0, hd];
  const plb: V = [-hw, 0, hd - plateau];
  const prb: V = [hw, 0, hd - plateau];

  const positions: number[] = [];

  quad(positions, flt, blt, brt, frt);
  quad(positions, flt, frt, frb, flb);
  quad(positions, flb, frb, prb, plb);
  if (plateau > 1e-4) {
    quad(positions, plb, prb, brb, blb);
  }
  quad(positions, blt, blb, brb, brt);

  if (plateau > 1e-4) {
    tri(positions, flt, flb, plb);
    tri(positions, flt, plb, blb);
    tri(positions, flt, blb, blt);
    tri(positions, frt, brt, brb);
    tri(positions, frt, brb, prb);
    tri(positions, frt, prb, frb);
  } else {
    tri(positions, flt, flb, blb);
    tri(positions, flt, blb, blt);
    tri(positions, frt, brt, brb);
    tri(positions, frt, brb, frb);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.computeVertexNormals();

  cache.set(key, geometry);
  return geometry;
}
