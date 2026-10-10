"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Grid, Lightformer, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CylinderGeometry, InstancedMesh, MeshStandardMaterial, Object3D } from "three";
import BrickBlock from "@/components/BrickBlock";
import { STUD_HEIGHT, STUD_RADIUS, buildHeightMap, computePlacement } from "@/lib/bricks";
import type {
  BlockType,
  BlockTypeSpec,
  BuilderMode,
  GridPosition,
  BrickData,
  BrickColor,
  Rotation,
} from "@/types/bricks";

/** Jarak pointer (px) antara pointerdown dan click; di atas ini dianggap drag kamera. */
const DRAG_THRESHOLD = 5;
/** Dorongan titik hit keluar dari sisi blok agar blok baru masuk ke sel sebelahnya. */
const FACE_NUDGE = 0.5;
const BASEPLATE_COLOR = "#b9c6d6";
const BASE_BOX_HEIGHT = 0.8;
/** Celah vertikal agar papan, bodi, stud, grid, dan bayangan tidak z-fight. */
const SURFACE_GAP = 0.03;
const STUD_LIFT = 0.012;

const baseStudGeometry = new CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 12);
const baseStudMaterial = new MeshStandardMaterial({
  color: BASEPLATE_COLOR,
  roughness: 0.85,
  envMapIntensity: 0.35,
});

export interface BrickCanvasProps {
  blocks: BrickData[];
  selectedId: string | null;
  mode: BuilderMode;
  gridSize: number;
  activeColor: BrickColor;
  activeType: BlockType;
  activeRotation: Rotation;
  customSpec?: BlockTypeSpec;
  readOnly?: boolean;
  realistic?: boolean;
  highlightIds?: ReadonlySet<string>;
  onPlace: (position: GridPosition) => void;
  onSelect: (id: string | null) => void;
}

export default function BrickCanvas(props: BrickCanvasProps) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ position: [34, 16, 34], fov: 42, near: 0.4, far: 2000 }}
      onPointerMissed={() => {
        if (!props.readOnly) props.onSelect(null);
      }}
    >
      <color attach="background" args={[props.realistic ? "#edf1f6" : "#dfe7f1"]} />
      <Scene {...props} />
    </Canvas>
  );
}

function Scene({
  blocks,
  selectedId,
  mode,
  gridSize,
  activeColor,
  activeType,
  activeRotation,
  customSpec,
  onPlace,
  onSelect,
  readOnly = false,
  realistic = false,
  highlightIds,
}: BrickCanvasProps) {
  const [hoverPoint, setHoverPoint] = useState<[number, number] | null>(null);
  const heightMap = useMemo(() => buildHeightMap(blocks), [blocks]);

  const preview = useMemo(
    () =>
      !readOnly && mode === "build" && hoverPoint
        ? computePlacement(heightMap, activeType, activeRotation, gridSize, hoverPoint[0], hoverPoint[1], customSpec)
        : null,
    [readOnly, mode, hoverPoint, heightMap, activeType, activeRotation, gridSize, customSpec],
  );

  const pointFromEvent = (event: ThreeEvent<PointerEvent | MouseEvent>, nudge: number) => {
    const point = event.point.clone();
    if (nudge && event.face) point.addScaledVector(event.face.normal, nudge);
    return [point.x, point.z] as [number, number];
  };

  const placeFromEvent = (event: ThreeEvent<MouseEvent>, nudge: number) => {
    const [px, pz] = pointFromEvent(event, nudge);
    onPlace(computePlacement(heightMap, activeType, activeRotation, gridSize, px, pz, customSpec));
  };

  const handleHover = (event: ThreeEvent<PointerEvent>, nudge: number) => {
    event.stopPropagation();
    if (readOnly || mode !== "build") return;
    setHoverPoint(pointFromEvent(event, nudge));
  };

  const clearHover = () => setHoverPoint(null);

  const handleFloorClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.delta > DRAG_THRESHOLD || readOnly) return;
    if (mode === "select") {
      onSelect(null);
      return;
    }
    placeFromEvent(event, 0);
  };

  const handleBlockClick = (event: ThreeEvent<MouseEvent>, id: string) => {
    event.stopPropagation();
    if (event.delta > DRAG_THRESHOLD || readOnly) return;
    if (mode === "select") {
      onSelect(id === selectedId ? null : id);
      return;
    }
    placeFromEvent(event, FACE_NUDGE);
  };

  const shadowExtent = gridSize / 2 + 4;

  return (
    <>
      <ambientLight intensity={realistic ? 0.55 : 0.45} />
      <directionalLight
        castShadow
        position={[gridSize * 0.4, gridSize, gridSize * 0.25]}
        intensity={realistic ? 1.85 : 1.6}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-camera-far={gridSize * 3}
        shadow-bias={-0.0002}
        shadow-normalBias={0.04}
      />
      <Environment resolution={256}>
        <Lightformer intensity={2} position={[0, 6, -10]} scale={[12, 6, 1]} />
        <Lightformer intensity={1} rotation-y={Math.PI / 2} position={[-10, 2, 0]} scale={[20, 3, 1]} />
        <Lightformer intensity={1} rotation-y={-Math.PI / 2} position={[10, 2, 0]} scale={[20, 3, 1]} />
        <Lightformer intensity={1.5} rotation-x={Math.PI / 2} position={[0, 10, 0]} scale={[10, 10, 1]} />
      </Environment>

      <mesh position={[0, -SURFACE_GAP - BASE_BOX_HEIGHT / 2, 0]} receiveShadow>
        <boxGeometry args={[gridSize + 1.4, BASE_BOX_HEIGHT, gridSize + 1.4]} />
        <meshStandardMaterial color="#8fa0b3" roughness={0.95} envMapIntensity={0.2} />
      </mesh>
      <mesh
        rotation-x={-Math.PI / 2}
        receiveShadow
        onPointerMove={(event) => handleHover(event, 0)}
        onPointerOut={clearHover}
        onClick={handleFloorClick}
      >
        <planeGeometry args={[gridSize, gridSize]} />
        <meshStandardMaterial color={BASEPLATE_COLOR} roughness={0.92} envMapIntensity={0.3} />
      </mesh>
      <BaseplateStuds key={gridSize} size={gridSize} />
      {!realistic && (
        <Grid
          position={[0, SURFACE_GAP, 0]}
          args={[gridSize, gridSize]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#8796a8"
          sectionSize={8}
          sectionThickness={1.2}
          sectionColor="#4b5b70"
          fadeDistance={gridSize * 4}
          fadeStrength={1}
        />
      )}
      <ContactShadows position={[0, SURFACE_GAP + 0.01, 0]} scale={gridSize * 1.5} opacity={0.28} blur={2.5} far={12} />

      {blocks.map((block) => (
        <BrickBlock
          key={block.id}
          type={block.type}
          custom={block.custom}
          color={block.color}
          rotation={block.rotation}
          position={block.position}
          selected={block.id === selectedId}
          realistic={realistic}
          highlight={highlightIds?.has(block.id) ?? false}
          onPointerMove={(event) => handleHover(event, FACE_NUDGE)}
          onPointerOut={clearHover}
          onClick={(event) => handleBlockClick(event, block.id)}
        />
      ))}

      {preview && (
        <BrickBlock
          ghost
          type={activeType}
          custom={customSpec}
          color={activeColor}
          rotation={activeRotation}
          position={preview}
        />
      )}

      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        minDistance={8}
        maxDistance={gridSize * 4}
        maxPolarAngle={Math.PI / 2.05}
      />
      <CameraFramer gridSize={gridSize} />
    </>
  );
}

function CameraFramer({ gridSize }: { gridSize: number }) {
  const getThree = useThree((state) => state.get);

  useLayoutEffect(() => {
    const { camera, controls } = getThree();
    const dist = Math.max(16, gridSize * 0.5);
    camera.position.set(dist, dist * 0.4, dist);
    camera.lookAt(0, 0, 0);
    const orbit = controls as OrbitControlsImpl | null;
    if (orbit && "target" in orbit) {
      orbit.target.set(0, 0, 0);
      orbit.update();
    }
  }, [gridSize, getThree]);

  return null;
}

function BaseplateStuds({ size }: { size: number }) {
  const ref = useRef<InstancedMesh>(null);
  const count = size * size;

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new Object3D();
    const half = size / 2;
    let i = 0;
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        dummy.position.set(x - half + 0.5, STUD_HEIGHT / 2 + STUD_LIFT, z - half + 0.5);
        dummy.updateMatrix();
        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [size]);

  return (
    <instancedMesh
      ref={ref}
      args={[baseStudGeometry, baseStudMaterial, count]}
      raycast={() => null}
    />
  );
}
