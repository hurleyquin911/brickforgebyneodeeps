import { ExtrudeGeometry, Shape, type BufferGeometry } from "three";

const cache = new Map<string, BufferGeometry>();

/**
 * Arch 1×N: badan penuh di atas, lengkungan di bawah.
 * Sumbu lokal: X lebar, Y tinggi (dasar 0), Z panjang.
 */
export function getArchGeometry(width: number, depth: number, height: number): BufferGeometry {
  const key = `arch:${width.toFixed(3)}:${depth.toFixed(3)}:${height.toFixed(3)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const leg = Math.min(0.7, Math.max(0.48, depth * 0.16));
  const radius = Math.max(0.35, (depth - 2 * leg) / 2);

  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, height);
  shape.lineTo(depth, height);
  shape.lineTo(depth, 0);
  shape.lineTo(depth - leg, 0);
  shape.absarc(depth / 2, 0, radius, 0, Math.PI, false);
  shape.closePath();

  const geometry = new ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: false,
    steps: 1,
    curveSegments: 28,
  });
  geometry.rotateY(Math.PI / 2);
  geometry.translate(width / 2, 0, -depth / 2);
  geometry.computeVertexNormals();

  cache.set(key, geometry);
  return geometry;
}
