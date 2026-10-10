"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { CylinderGeometry, Group, InstancedMesh, MeshStandardMaterial, Object3D } from "three";
import BrickBlock from "@/components/BrickBlock";
import { STUD_HEIGHT, STUD_RADIUS } from "@/lib/bricks";
import { frameModel } from "@/lib/modelFrame";
import { findSharedSet } from "@/lib/showcase";
import type { BrickData } from "@/types/bricks";

const PLATE = 64;
const PLATE_COLOR = "#c5d0da";
const STUD_LIFT = 0.012;

const studGeometry = new CylinderGeometry(STUD_RADIUS, STUD_RADIUS * 0.96, STUD_HEIGHT, 20);
const studMaterial = new MeshStandardMaterial({
  color: PLATE_COLOR,
  roughness: 0.42,
  metalness: 0.04,
  envMapIntensity: 0.85,
});

function Plate() {
  const ref = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new Object3D();
    const half = PLATE / 2;
    let index = 0;
    for (let x = 0; x < PLATE; x++) {
      for (let z = 0; z < PLATE; z++) {
        dummy.position.set(x - half + 0.5, STUD_HEIGHT / 2 + STUD_LIFT, z - half + 0.5);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        index += 1;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[PLATE, PLATE]} />
        <meshStandardMaterial color={PLATE_COLOR} roughness={0.62} metalness={0.02} envMapIntensity={0.45} />
      </mesh>
      <instancedMesh ref={ref} args={[studGeometry, studMaterial, PLATE * PLATE]} raycast={() => null} />
    </group>
  );
}

function StillScene() {
  const blocks = findSharedSet("rumah-jendela")?.blocks ?? [];
  const frame = useMemo(() => frameModel(blocks), [blocks]);
  const pose = useMemo(() => {
    const distance = frame.span * 3.15;
    const azimuth = Math.PI * 0.7;
    const elevation = 0.42;
    const horiz = Math.cos(elevation) * distance;
    return [Math.sin(azimuth) * horiz, frame.center[1] + Math.sin(elevation) * distance, Math.cos(azimuth) * horiz] as [
      number,
      number,
      number,
    ];
  }, [frame]);
  const look = useMemo<[number, number, number]>(() => [0, frame.center[1] * 0.35, 0], [frame.center]);

  return (
    <>
      <color attach="background" args={[PLATE_COLOR]} />
      <ambientLight intensity={0.48} />
      <directionalLight position={[9, 16, 7]} intensity={2.05} />
      <directionalLight position={[-8, 6, -5]} intensity={0.42} />
      <Environment resolution={128}>
        <Lightformer intensity={2.4} position={[0, 6, -10]} scale={[12, 5, 1]} />
        <Lightformer intensity={1.1} rotation-y={Math.PI / 2} position={[-10, 3, 2]} scale={[14, 4, 1]} />
        <Lightformer intensity={1.6} rotation-x={Math.PI / 2} position={[0, 12, 0]} scale={[10, 10, 1]} />
      </Environment>
      <SpinningHouse blocks={blocks} offset={[-frame.center[0], 0, -frame.center[2]]} />
      <ContactShadows position={[0, 0.03, 0]} opacity={0.42} scale={16} blur={2.4} far={5} />
      <FrameCamera pose={pose} look={look} />
    </>
  );
}

function SpinningHouse({ blocks, offset }: { blocks: BrickData[]; offset: [number, number, number] }) {
  const ref = useRef<Group>(null);
  const paused = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      paused.current = media.matches;
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useFrame((_, delta) => {
    if (!ref.current || paused.current) return;
    ref.current.rotation.y += delta * 0.32;
  });

  return (
    <group ref={ref}>
      <Plate />
      <group position={offset}>
        {blocks.map((block) => (
          <BrickBlock
            key={block.id}
            type={block.type}
            color={block.color}
            rotation={block.rotation}
            position={block.position}
            realistic
          />
        ))}
      </group>
    </group>
  );
}

function FrameCamera({ pose, look }: { pose: [number, number, number]; look: [number, number, number] }) {
  const camera = useThree((state) => state.camera);

  useLayoutEffect(() => {
    camera.position.set(pose[0], pose[1], pose[2]);
    camera.lookAt(look[0], look[1], look[2]);
  }, [camera, pose, look]);

  return null;
}

export default function HeroStill() {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [12, 8, 12], fov: 30, near: 0.1, far: 80 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true }}
    >
      <StillScene />
    </Canvas>
  );
}
