"use client";

import { Instance, Instances, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Matrix4, Object3D, type InstancedMesh } from "three";
import * as Tone from "tone";

import { DEFAULT_PERFORMER_COUNT, SET_DURATION_TICKS, useStepOffStore } from "@/lib/useStore";

const interpolate = (start: number, end: number, progress: number) =>
  start + (end - start) * progress;

function PerformerEngine() {
  const performerData = useStepOffStore((state) => state.performerData);
  const currentTick = useStepOffStore((state) => state.currentTick);
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

  const interpolationProgress = useMemo(
    () => (currentTick % SET_DURATION_TICKS) / SET_DURATION_TICKS,
    [currentTick],
  );

  const positions = useMemo(() => {
    return Array.from({ length: DEFAULT_PERFORMER_COUNT }, (_, index) => {
      const baseX = performerData[index * 3];
      const baseY = performerData[index * 3 + 1];
      const baseZ = performerData[index * 3 + 2];

      const targetX = baseX + (index % 2 === 0 ? 1.2 : -1.2);
      const targetZ = baseZ + 1;

      return [
        interpolate(baseX, targetX, interpolationProgress),
        baseY,
        interpolate(baseZ, targetZ, interpolationProgress),
      ] as [number, number, number];
    });
  }, [interpolationProgress, performerData]);

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
          <Instance key={index} position={position} />
        ))}
      </Instances>

      <instancedMesh ref={markerRef} args={[undefined, undefined, 25]}>
        <boxGeometry args={[1, 0.04, 1]} />
        <meshStandardMaterial color="#334155" />
      </instancedMesh>
    </>
  );
}

export default function FieldCanvas() {
  return (
    <div className="h-[55vh] w-full rounded-box border border-base-300 bg-base-200">
      <Canvas camera={{ position: [0, 22, 38], fov: 48 }}>
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
