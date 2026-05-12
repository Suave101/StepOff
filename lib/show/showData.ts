import showMap from "@/lib/show/showMap.json";

export type ShowSet = {
  id: string;
  name: string;
  startTick: number;
  lengthTicks: number;
};

export type PerformerProfile = {
  id: string;
  name: string;
  section: string;
};

const SECTION_NAMES = ["Brass", "Woodwinds", "Battery", "Front Ensemble"];
const DEFAULT_ROSTER_COUNT = 200;
const DEFAULT_TOTAL_TICKS = 960 * 16;

export const SHOW_SETS: ShowSet[] = (showMap.sets as ShowSet[]).slice().sort((a, b) => a.startTick - b.startTick);

export const TOTAL_SHOW_TICKS =
  SHOW_SETS.length > 0
    ? SHOW_SETS[SHOW_SETS.length - 1].startTick + SHOW_SETS[SHOW_SETS.length - 1].lengthTicks
    : DEFAULT_TOTAL_TICKS;

export const findSetIndexByTick = (tick: number) => {
  if (SHOW_SETS.length === 0) {
    return 0;
  }

  let bestMatchIndex = 0;
  for (let index = 0; index < SHOW_SETS.length; index += 1) {
    if (tick >= SHOW_SETS[index].startTick) {
      bestMatchIndex = index;
    } else {
      break;
    }
  }
  return bestMatchIndex;
};

export const buildPerformerRoster = (count = DEFAULT_ROSTER_COUNT): PerformerProfile[] => {
  const sectionSize = Math.ceil(count / SECTION_NAMES.length);

  return Array.from({ length: count }, (_, index) => {
    const section = SECTION_NAMES[Math.floor(index / sectionSize)] ?? SECTION_NAMES[SECTION_NAMES.length - 1];
    return {
      id: `P-${String(index + 1).padStart(3, "0")}`,
      name: `Performer ${String(index + 1).padStart(3, "0")}`,
      section,
    };
  });
};
