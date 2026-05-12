"use client";

import { Html, Instance, Instances, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as Tone from "tone";

import { getPerformerPositionAtTick } from "@/lib/performerMotion";
import { DEFAULT_PERFORMER_COUNT, useStepOffStore } from "@/lib/useStore";

export type CameraPreset = "box" | "sideline" | "performer";

const FIELD_WIDTH = 80;
const FIELD_HEIGHT = 40;
const FRONT_HASH_Z = -8;
const BACK_HASH_Z = 8;
const YARD_LINES = 21;

function FieldMarkings() {
  const yardLineSpacing = FIELD_WIDTH / (YARD_LINES - 1);
  const yardLinePositions = useMemo(
    () => Array.from({ length: YARD_LINES }, (_, index) => -FIELD_WIDTH / 2 + yardLineSpacing * index),
    [yardLineSpacing],
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[FIELD_WIDTH, FIELD_HEIGHT]} />
        <meshStandardMaterial color="#166534" roughness={0.9} metalness={0} />
      </mesh>

      <mesh position={[0, 0.01, -FIELD_HEIGHT / 2]}>
        <boxGeometry args={[FIELD_WIDTH, 0.02, 0.16]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 0.01, FIELD_HEIGHT / 2]}>
        <boxGeometry args={[FIELD_WIDTH, 0.02, 0.16]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[-FIELD_WIDTH / 2, 0.01, 0]}>
        <boxGeometry args={[0.16, 0.02, FIELD_HEIGHT]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[FIELD_WIDTH / 2, 0.01, 0]}>
        <boxGeometry args={[0.16, 0.02, FIELD_HEIGHT]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {yardLinePositions.map((lineX, lineIndex) => (
        <mesh key={`yard-${lineIndex}`} position={[lineX, 0.01, 0]}>
          <boxGeometry args={[0.08, 0.02, FIELD_HEIGHT]} />
          <meshStandardMaterial color={lineIndex % 5 === 0 ? "#e2e8f0" : "#cbd5e1"} />
        </mesh>
      ))}

      {yardLinePositions.slice(1, -1).map((lineX, lineIndex) => (
        <group key={`hash-${lineIndex}`}>
          <mesh position={[lineX, 0.02, FRONT_HASH_Z]}>
            <boxGeometry args={[0.45, 0.02, 0.1]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[lineX, 0.02, BACK_HASH_Z]}>
            <boxGeometry args={[0.45, 0.02, 0.1]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PerformerEngine({ cameraPreset }: { cameraPreset: CameraPreset }) {
  const performerData = useStepOffStore((state) => state.performerData);
  const currentTick = useStepOffStore((state) => state.currentTick);
  const selectedPerformerIndex = useStepOffStore((state) => state.selectedPerformerIndex);
  const performerRoster = useStepOffStore((state) => state.performerRoster);
  const selectPerformer = useStepOffStore((state) => state.selectPerformer);

  useFrame(() => {
    if (Tone.Transport.state !== "started") {
      return;
    }

    const transportTick = Tone.Transport.ticks;
    const state = useStepOffStore.getState();
    if (transportTick !== state.currentTick) {
      state.setTransportTick(transportTick);
    }
  });

  const positions = useMemo(() => {
    return Array.from({ length: DEFAULT_PERFORMER_COUNT }, (_, index) => {
      return getPerformerPositionAtTick(performerData, index, currentTick);
    });
  }, [currentTick, performerData]);

  const selectedPosition = useMemo(() => {
    if (selectedPerformerIndex === null) {
      return null;
    }
    return positions[selectedPerformerIndex] ?? null;
  }, [positions, selectedPerformerIndex]);

  const selectedPerformer = selectedPerformerIndex === null ? null : performerRoster[selectedPerformerIndex];
  const cameraPosition = useMemo<[number, number, number]>(() => {
    if (cameraPreset === "box") {
      return [0, 48, 0.1];
    }

    if (cameraPreset === "performer" && selectedPosition) {
      return [selectedPosition[0] + 1.5, selectedPosition[1] + 9, selectedPosition[2] + 12];
    }

    return [0, 14, 46];
  }, [cameraPreset, selectedPosition]);
  const cameraTarget = useMemo<[number, number, number]>(() => {
    if (cameraPreset === "performer" && selectedPosition) {
      return [selectedPosition[0], selectedPosition[1], selectedPosition[2]];
    }
    return [0, 0, 0];
  }, [cameraPreset, selectedPosition]);

  return (
    <>
      <PerspectiveCamera makeDefault position={cameraPosition} fov={cameraPreset === "box" ? 38 : 48} />
      <Instances limit={DEFAULT_PERFORMER_COUNT} range={DEFAULT_PERFORMER_COUNT}>
        <sphereGeometry args={[0.32, 10, 10]} />
        <meshStandardMaterial color="#f97316" roughness={0.35} metalness={0.6} />
        {positions.map((position, index) => (
          <Instance
            key={index}
            position={position}
            color={selectedPerformerIndex === index ? "#22d3ee" : "#f97316"}
            onClick={(event) => {
              event.stopPropagation();
              selectPerformer(index, performerRoster[index]?.id ?? null);
            }}
          />
        ))}
      </Instances>

      <FieldMarkings />

      {selectedPosition && selectedPerformer && (
        <Html
          position={[selectedPosition[0], selectedPosition[1] + 1.05, selectedPosition[2]]}
          center
          distanceFactor={24}
        >
          <div className="badge badge-info badge-sm border-none">{selectedPerformer.id}</div>
        </Html>
      )}

      <OrbitControls makeDefault enablePan enableZoom enableRotate target={cameraTarget} />
    </>
  );
}

export default function FieldCanvas({ cameraPreset }: { cameraPreset: CameraPreset }) {
  const selectPerformer = useStepOffStore((state) => state.selectPerformer);

  return (
    <div className="h-full w-full rounded-none border border-[#2d2d2d] bg-[#1f1f1f]">
      <Canvas
        onPointerMissed={() => {
          selectPerformer(null, null);
        }}
      >
        <color attach="background" args={["#0b1220"]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[18, 30, 10]} intensity={1.05} />
        <PerformerEngine cameraPreset={cameraPreset} />
      </Canvas>
    </div>
  );
}
