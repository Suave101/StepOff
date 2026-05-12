import { create } from "zustand";

export const TICKS_PER_BEAT = 960;
export const TARGET_FPS = 60;
export const DEFAULT_PERFORMER_COUNT = 200;
const SET_DURATION_TICKS = TICKS_PER_BEAT * 4;

type StepOffState = {
  currentTick: number;
  bpm: number;
  activeSet: number;
  performerData: Float32Array;
  updateFromAudioClock: (audioSeconds: number) => void;
  setBpm: (bpm: number) => void;
};

const createInitialPerformerData = (count: number) => {
  const data = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const column = index % 20;
    const row = Math.floor(index / 20);
    data[index * 3] = column * 2 - 19;
    data[index * 3 + 1] = 0.2;
    data[index * 3 + 2] = row * 2 - 9;
  }
  return data;
};

export const useStepOffStore = create<StepOffState>((set, get) => ({
  currentTick: 0,
  bpm: 120,
  activeSet: 0,
  performerData: createInitialPerformerData(DEFAULT_PERFORMER_COUNT),
  updateFromAudioClock: (audioSeconds) => {
    const { bpm } = get();
    const ticksPerSecond = (bpm / 60) * TICKS_PER_BEAT;
    const currentTick = Math.floor(audioSeconds * ticksPerSecond);
    set({
      currentTick,
      activeSet: Math.floor(currentTick / SET_DURATION_TICKS),
    });
  },
  setBpm: (bpm) => {
    set({ bpm });
  },
}));
