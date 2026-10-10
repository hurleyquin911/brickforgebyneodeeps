"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import BrickBlock from "@/components/BrickBlock";
import { cameraPose, fitDistance, frameModel } from "@/lib/modelFrame";
import type { BrickData } from "@/types/bricks";

function CameraRig({
  center,
  pose,
  interactive,
  viewKey,
}: {
  center: [number, number, number];
  pose: [number, number, number];
  interactive: boolean;
  viewKey: number;
}) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null;
  const goal = useRef(new Vector3());
  const look = useRef(new Vector3());
  const settling = useRef(true);

  useEffect(() => {
    goal.current.set(pose[0], pose[1], pose[2]);
    look.current.set(center[0], center[1], center[2]);
    settling.current = true;
    if (controls) {
      controls.target.copy(look.current);
      controls.update();
    }
    camera.position.copy(goal.current);
    camera.lookAt(look.current);
  }, [pose, center, viewKey, controls, camera]);

  useFrame(() => {
    if (!settling.current) return;
    camera.position.lerp(goal.current, 0.18);
    if (controls) {
      controls.target.lerp(look.current, 0.22);
      controls.update();
    } else {
      camera.lookAt(look.current);
    }
    const cameraReady = camera.position.distanceTo(goal.current) < 0.05;
    const targetReady = !controls || controls.target.distanceTo(look.current) < 0.05;
    if (cameraReady && targetReady && interactive) settling.current = false;
  });

  return null;
}

function StageScene({
  blocks,
  view,
  interactive,
}: {
  blocks: BrickData[];
  view: number;
  interactive: boolean;
}) {
  const frame = useMemo(() => frameModel(blocks), [blocks]);
  const aspect = useThree((state) => state.size.width / Math.max(state.size.height, 1));
  const distance = fitDistance(frame.span, aspect);
  const pose = useMemo(() => cameraPose(frame, view, distance), [frame, view, distance]);

  return (
    <>
      <color attach="background" args={["#efe6d4"]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[frame.span, frame.span * 1.6, frame.span * 0.4]} intensity={1.7} />
      <Environment resolution={128}>
        <Lightformer intensity={2} position={[0, 5, -8]} scale={[10, 4, 1]} />
        <Lightformer intensity={1.2} rotation-x={Math.PI / 2} position={[0, 8, 0]} scale={[8, 8, 1]} />
      </Environment>
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
      <ContactShadows
        position={[frame.center[0], frame.floor - 0.02, frame.center[2]]}
        opacity={0.38}
        scale={frame.span * 4}
        blur={2.2}
        far={frame.span * 1.4}
      />
      <CameraRig center={frame.center} pose={pose} interactive={interactive} viewKey={view} />
      {interactive && (
        <OrbitControls
          makeDefault
          enablePan={false}
          target={frame.center}
          minDistance={distance * 0.45}
          maxDistance={distance * 2.4}
          maxPolarAngle={Math.PI / 2.05}
        />
      )}
    </>
  );
}

export default function SetStage({
  blocks,
  view,
  interactive = false,
}: {
  blocks: BrickData[];
  view: number;
  interactive?: boolean;
}) {
  const frame = useMemo(() => frameModel(blocks), [blocks]);
  const pose = useMemo(() => cameraPose(frame, view), [frame, view]);

  return (
    <Canvas
      camera={{ position: pose, fov: 30, near: 0.1, far: 200 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
    >
      <StageScene blocks={blocks} view={view} interactive={interactive} />
    </Canvas>
  );
}
