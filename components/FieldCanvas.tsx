"use client";

import { Html, Instance, Instances, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Matrix4, Object3D, type InstancedMesh } from "three";
import * as Tone from "tone";

import { getPerformerPositionAtTick } from "@/lib/performerMotion";
import { DEFAULT_PERFORMER_COUNT, useStepOffStore } from "@/lib/useStore";

function PerformerEngine() {
  const performerData = useStepOffStore((state) => state.performerData);
  const currentTick = useStepOffStore((state) => state.currentTick);
  const selectedPerformerIndex = useStepOffStore((state) => state.selectedPerformerIndex);
  const performerRoster = useStepOffStore((state) => state.performerRoster);
  const selectPerformer = useStepOffStore((state) => state.selectPerformer);
  const markerRef = useRef<InstancedMesh>(null);

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

  useEffect(() => {
    if (!markerRef.current) {
      return;
    }

    const dummy = new Object3D();
    const matrix = new Matrix4();

    for (let markerIndex = 0; markerIndex < 25; markerIndex += 1) {
      dummy.position.set(markerIndex * 3 - 36, 0, 18);
      dummy.updateMatrix();
      matrix.copy(dummy.matrix);
      markerRef.current.setMatrixAt(markerIndex, matrix);
    }

    markerRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <>
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
              selectPerformer(index);
            }}
          />
        ))}
      </Instances>

      <instancedMesh ref={markerRef} args={[undefined, undefined, 25]}>
        <boxGeometry args={[1, 0.04, 1]} />
        <meshStandardMaterial color="#334155" />
      </instancedMesh>

      {selectedPosition && selectedPerformer && (
        <Html
          position={[selectedPosition[0], selectedPosition[1] + 1.05, selectedPosition[2]]}
          center
          distanceFactor={24}
        >
          <div className="badge badge-info badge-sm border-none">{selectedPerformer.id}</div>
        </Html>
      )}
    </>
  );
}

export default function FieldCanvas() {
  const selectPerformer = useStepOffStore((state) => state.selectPerformer);

  return (
    <div className="h-[55vh] w-full rounded-box border border-base-300 bg-base-200">
      <Canvas
        camera={{ position: [0, 22, 38], fov: 48 }}
        onPointerMissed={() => {
          selectPerformer(null);
        }}
      >
        <color attach="background" args={["#0f172a"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[18, 24, 10]} intensity={1.1} />
        <gridHelper args={[80, 40, "#64748b", "#1e293b"]} />
        <PerformerEngine />
        <OrbitControls makeDefault enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
}
