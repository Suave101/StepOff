import { SET_DURATION_TICKS } from "@/lib/useStore";

const interpolate = (start: number, end: number, progress: number) =>
  start + (end - start) * progress;

export const getPerformerPositionAtTick = (
  performerData: Float32Array,
  performerIndex: number,
  currentTick: number,
): [number, number, number] => {
  const interpolationProgress = (currentTick % SET_DURATION_TICKS) / SET_DURATION_TICKS;
  const baseX = performerData[performerIndex * 3];
  const baseY = performerData[performerIndex * 3 + 1];
  const baseZ = performerData[performerIndex * 3 + 2];

  const targetX = baseX + (performerIndex % 2 === 0 ? 1.2 : -1.2);
  const targetZ = baseZ + 1;

  return [
    interpolate(baseX, targetX, interpolationProgress),
    baseY,
    interpolate(baseZ, targetZ, interpolationProgress),
  ];
};
