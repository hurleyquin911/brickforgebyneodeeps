"use client";

import { memo, useEffect, useMemo } from "react";
import { Edges } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { CylinderGeometry, MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import {
  BRICK_GAP,
  DEFAULT_CUSTOM_SPEC,
  BRICK_COLORS,
  PLATE_HEIGHT,
  STUD_HEIGHT,
  STUD_RADIUS,
  footprintOf,
  getActiveSpec,
  getStudOffsets,
} from "@/lib/bricks";
import { getArchGeometry } from "@/lib/partGeometry";
import { getInvertedSlopeGeometry, getSlopeGeometry } from "@/lib/slopeGeometry";
import type { BlockType, BlockTypeSpec, GridPosition, BrickColor, Rotation } from "@/types/bricks";

const studGeometry = new CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 20);
const noRaycast = () => null;

interface BrickProps {
  type: BlockType;
  color: BrickColor;
  rotation: Rotation;
  position: GridPosition;
  custom?: BlockTypeSpec;
  selected?: boolean;
  ghost?: boolean;
  realistic?: boolean;
  highlight?: boolean;
  onPointerMove?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
}

function BrickBlock({
  type,
  color,
  rotation,
  position,
  custom,
  selected = false,
  ghost = false,
  realistic = false,
  highlight = false,
  onPointerMove,
  onPointerOut,
  onClick,
}: BrickProps) {
  const spec = getActiveSpec(type, custom ?? DEFAULT_CUSTOM_SPEC);
  const [w, d] = footprintOf(spec, rotation);
  const [x, level, z] = position;
  const height = spec.height * PLATE_HEIGHT;
  const yaw = rotation === 90 ? Math.PI / 2 : 0;

  const material = useMemo(() => {
    const hex = BRICK_COLORS[color].hex;
    const shared = {
      color: hex,
      transparent: ghost,
      opacity: ghost ? 0.45 : 1,
      depthWrite: !ghost,
      emissive: hex,
      emissiveIntensity: highlight ? 0.28 : selected ? 0.35 : 0,
    };
    if (realistic && !ghost) {
      return new MeshPhysicalMaterial({
        ...shared,
        roughness: spec.studs ? 0.22 : 0.12,
        metalness: 0,
        clearcoat: 0.7,
        clearcoatRoughness: 0.18,
        sheen: 0.2,
        sheenColor: hex,
        sheenRoughness: 0.35,
        envMapIntensity: 1.15,
      });
    }
    return new MeshStandardMaterial({
      ...shared,
      roughness: spec.studs ? 0.3 : 0.18,
      metalness: 0.05,
    });
  }, [color, ghost, selected, highlight, realistic, spec.studs]);
  useEffect(() => () => material.dispose(), [material]);

  const studs = useMemo(() => getStudOffsets(spec), [spec]);

  const bodyProps = {
    material,
    castShadow: !ghost,
    receiveShadow: !ghost,
    raycast: ghost ? noRaycast : undefined,
    onPointerMove,
    onPointerOut,
    onClick,
  };

  const radius = Math.min(spec.width, spec.depth) / 2 - BRICK_GAP / 2;
  const bw = spec.width - BRICK_GAP;
  const bd = spec.depth - BRICK_GAP;
  const edgeColor = highlight ? "#fbbf24" : "#38bdf8";
  const showEdges = selected || highlight;
  const grillRidges = Math.max(2, Math.round(spec.depth * 2));

  return (
    <group position={[x + w / 2, level * PLATE_HEIGHT, z + d / 2]} rotation-y={yaw}>
      {spec.shape === "slope" ? (
        <mesh {...bodyProps} geometry={getSlopeGeometry(bw, bd, height)}>
          {showEdges && <Edges color={edgeColor} lineWidth={2} />}
        </mesh>
      ) : spec.shape === "slope-inv" ? (
        <mesh {...bodyProps} geometry={getInvertedSlopeGeometry(bw, bd, height)}>
          {showEdges && <Edges color={edgeColor} lineWidth={2} />}
        </mesh>
      ) : spec.shape === "arch" ? (
        <mesh {...bodyProps} geometry={getArchGeometry(bw, bd, height)}>
          {showEdges && <Edges color={edgeColor} lineWidth={2} threshold={22} />}
        </mesh>
      ) : spec.shape === "cone" ? (
        <mesh {...bodyProps} position={[0, height / 2, 0]}>
          <cylinderGeometry args={[STUD_RADIUS + 0.04, radius, height, 28]} />
          {showEdges && <Edges color={edgeColor} lineWidth={2} threshold={25} />}
        </mesh>
      ) : spec.shape === "dish" ? (
        <mesh {...bodyProps} position={[0, height / 2, 0]}>
          <cylinderGeometry args={[radius, radius * 0.38, height, 36]} />
          {showEdges && <Edges color={edgeColor} lineWidth={2} threshold={22} />}
        </mesh>
      ) : spec.shape === "round" ? (
        <mesh {...bodyProps} position={[0, height / 2, 0]}>
          <cylinderGeometry args={[radius, radius, height, 40]} />
          {showEdges && <Edges color={edgeColor} lineWidth={2} threshold={30} />}
        </mesh>
      ) : spec.shape === "grill" ? (
        <>
          <mesh {...bodyProps} position={[0, height / 2, 0]}>
            <boxGeometry args={[bw, height, bd]} />
            {showEdges && <Edges color={edgeColor} lineWidth={2} />}
          </mesh>
          {Array.from({ length: grillRidges }, (_, i) => {
            const oz = -bd / 2 + ((i + 1) / (grillRidges + 1)) * bd;
            return (
              <mesh
                key={oz}
                material={material}
                position={[0, height + 0.03, oz]}
                castShadow={!ghost}
                raycast={noRaycast}
              >
                <boxGeometry args={[bw * 0.86, 0.06, 0.1]} />
              </mesh>
            );
          })}
        </>
      ) : (
        <mesh {...bodyProps} position={[0, height / 2, 0]}>
          <boxGeometry args={[bw, height, bd]} />
          {showEdges && <Edges color={edgeColor} lineWidth={2} />}
        </mesh>
      )}
      {studs.map(([sx, sz]) => (
        <mesh
          key={`${sx}:${sz}`}
          geometry={studGeometry}
          material={material}
          position={[sx, height + STUD_HEIGHT / 2, sz]}
          castShadow={!ghost}
          raycast={noRaycast}
        />
      ))}
    </group>
  );
}

export default memo(BrickBlock);
