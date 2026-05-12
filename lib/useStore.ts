import { create } from "zustand";

import { buildPerformerRoster, findSetIndexByTick, SHOW_SETS, type PerformerProfile } from "@/lib/show/showData";

export const TICKS_PER_BEAT = 960;
export const TARGET_FPS = 60;
export const DEFAULT_PERFORMER_COUNT = 200;
export const SET_DURATION_TICKS = TICKS_PER_BEAT * 4;

type StepOffState = {
  currentTick: number;
  bpm: number;
  activeSet: number;
  showSets: typeof SHOW_SETS;
  selectedPerformerIndex: number | null;
  selectedPerformerId: string | null;
  performerRoster: PerformerProfile[];
  maxTick: number;
  performerData: Float32Array;
  setTransportTick: (currentTick: number) => void;
  selectPerformer: (performerIndex: number | null, performerId?: string | null) => void;
  setBpm: (bpm: number) => void;
};

const createInitialPerformerData = (count: number) => {
  const data = new Float32Array(count * 3);
  for (let performerIndex = 0; performerIndex < count; performerIndex += 1) {
    const column = performerIndex % 20;
    const row = Math.floor(performerIndex / 20);
    data[performerIndex * 3] = column * 2 - 19;
    data[performerIndex * 3 + 1] = 0.2;
    data[performerIndex * 3 + 2] = row * 2 - 9;
  }
  return data;
};

export const useStepOffStore = create<StepOffState>((set) => ({
  currentTick: 0,
  bpm: 120,
  activeSet: 0,
  showSets: SHOW_SETS,
  selectedPerformerIndex: null,
  selectedPerformerId: null,
  performerRoster: buildPerformerRoster(DEFAULT_PERFORMER_COUNT),
  maxTick:
    SHOW_SETS.length > 0
      ? SHOW_SETS[SHOW_SETS.length - 1].startTick + SHOW_SETS[SHOW_SETS.length - 1].lengthTicks
      : SET_DURATION_TICKS,
  performerData: createInitialPerformerData(DEFAULT_PERFORMER_COUNT),
  setTransportTick: (currentTick) => {
    const nextTick = Math.max(0, Math.floor(currentTick));
    set({
      currentTick: nextTick,
      activeSet: findSetIndexByTick(nextTick),
    });
  },
  selectPerformer: (selectedPerformerIndex, selectedPerformerId = null) => {
    set({ selectedPerformerIndex, selectedPerformerId });
  },
  setBpm: (bpm) => {
    set({ bpm });
  },
}));
