"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import * as Tone from "tone";

import { audioController } from "@/lib/audio/AudioController";
import { getPerformerPositionAtTick } from "@/lib/performerMotion";
import { TICKS_PER_BEAT, useStepOffStore } from "@/lib/useStore";

const FieldCanvas = dynamic(() => import("@/components/FieldCanvas"), {
  ssr: false,
});

export default function StepOffDashboard() {
  const [running, setRunning] = useState(false);
  const bpm = useStepOffStore((state) => state.bpm);
  const currentTick = useStepOffStore((state) => state.currentTick);
  const activeSet = useStepOffStore((state) => state.activeSet);
  const maxTick = useStepOffStore((state) => state.maxTick);
  const showSets = useStepOffStore((state) => state.showSets);
  const performerRoster = useStepOffStore((state) => state.performerRoster);
  const selectedPerformerIndex = useStepOffStore((state) => state.selectedPerformerIndex);
  const performerData = useStepOffStore((state) => state.performerData);

  const beat = useMemo(() => Math.floor(currentTick / TICKS_PER_BEAT) + 1, [currentTick]);
  const selectedPerformer =
    selectedPerformerIndex === null ? null : performerRoster[selectedPerformerIndex] ?? null;
  const selectedPosition = useMemo(() => {
    if (selectedPerformerIndex === null) {
      return null;
    }
    return getPerformerPositionAtTick(performerData, selectedPerformerIndex, currentTick);
  }, [currentTick, performerData, selectedPerformerIndex]);

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-300 text-base-content">
      <input id="set-list-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 md:p-6">
          <div className="card border border-base-100 bg-base-200 shadow-xl">
            <div className="card-body gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-accent">StepOff Command Surface</p>
                  <h1 className="text-2xl font-bold">Precision over polish.</h1>
                </div>
                <label htmlFor="set-list-drawer" className="btn btn-sm btn-outline drawer-button lg:hidden">
                  Sets
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="stat rounded-box border border-base-100 bg-base-100">
                  <div className="stat-title">Tick</div>
                  <div className="stat-value text-primary">{currentTick}</div>
                </div>
                <div className="stat rounded-box border border-base-100 bg-base-100">
                  <div className="stat-title">Beat</div>
                  <div className="stat-value text-secondary">{beat}</div>
                </div>
                <div className="stat rounded-box border border-base-100 bg-base-100">
                  <div className="stat-title">Active Set</div>
                  <div className="stat-value text-accent">{showSets[activeSet]?.name ?? `Set ${activeSet + 1}`}</div>
                </div>
              </div>

              <label className="form-control">
                <div className="label pb-1">
                  <span className="label-text">Precision Scrub</span>
                  <span className="label-text-alt">
                    {showSets[activeSet]?.name ?? "Set"} · Tick {currentTick}
                  </span>
                </div>
                <input
                  className="range range-primary"
                  type="range"
                  min={0}
                  max={maxTick}
                  step={1}
                  value={currentTick}
                  disabled={Tone.Transport.state === "started"}
                  onChange={(event) => {
                    if (Tone.Transport.state !== "started") {
                      audioController.seekToTick(Number(event.target.value));
                    }
                  }}
                />
              </label>

              <div className="flex flex-wrap items-end gap-3">
                <label className="form-control w-40">
                  <div className="label">
                    <span className="label-text">BPM</span>
                  </div>
                  <input
                    className="input input-bordered"
                    min={40}
                    max={240}
                    type="number"
                    value={bpm}
                    onChange={(event) => {
                      const nextBpm = Number(event.target.value);
                      if (!Number.isNaN(nextBpm)) {
                        audioController.setBpm(nextBpm);
                      }
                    }}
                  />
                </label>

                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={activeSet <= 0}
                  onClick={() => {
                    const previousSet = showSets[Math.max(0, activeSet - 1)];
                    if (previousSet) {
                      audioController.seekToTick(previousSet.startTick);
                    }
                  }}
                >
                  Previous Set
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    await audioController.start();
                    setRunning(true);
                  }}
                >
                  Start Clock
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    audioController.stop();
                    setRunning(false);
                  }}
                >
                  Stop Clock
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={activeSet >= showSets.length - 1}
                  onClick={() => {
                    const nextSet = showSets[Math.min(showSets.length - 1, activeSet + 1)];
                    if (nextSet) {
                      audioController.seekToTick(nextSet.startTick);
                    }
                  }}
                >
                  Next Set
                </button>

                <span className={`badge ${running ? "badge-success" : "badge-neutral"}`}>
                  {running ? "Audio Sync Active" : "Standing By"}
                </span>
              </div>

              {selectedPerformer && selectedPosition && (
                <div className="card border border-info bg-base-100">
                  <div className="card-body p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-info">Performer Info Card</p>
                        <h3 className="font-semibold">
                          {selectedPerformer.name} · {selectedPerformer.id}
                        </h3>
                      </div>
                      <span className="badge badge-info badge-outline">{selectedPerformer.section}</span>
                    </div>
                    <p className="text-sm text-base-content/80">
                      Position: x {selectedPosition[0].toFixed(2)}, y {selectedPosition[1].toFixed(2)}, z{" "}
                      {selectedPosition[2].toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <FieldCanvas />
        </div>
      </div>

      <div className="drawer-side z-20">
        <label htmlFor="set-list-drawer" aria-label="close sidebar" className="drawer-overlay" />
        <aside className="min-h-full w-72 border-r border-base-100 bg-base-200 p-3">
          <div className="mb-3 border-b border-base-100 pb-2">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Set-List Sidebar</p>
            <h2 className="text-lg font-bold">Director Navigation</h2>
          </div>
          <ul className="menu h-[calc(100vh-7rem)] flex-nowrap overflow-y-auto rounded-box bg-base-100">
            {showSets.map((setItem, index) => (
              <li key={setItem.id}>
                <button
                  type="button"
                  className={index === activeSet ? "active" : ""}
                  onClick={() => {
                    audioController.seekToTick(setItem.startTick);
                  }}
                >
                  <span>{setItem.name}</span>
                  <span className="badge badge-ghost">T{setItem.startTick}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
