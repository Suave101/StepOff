"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { audioController } from "@/lib/audio/AudioController";
import { TICKS_PER_BEAT, useStepOffStore } from "@/lib/useStore";

const FieldCanvas = dynamic(() => import("@/components/FieldCanvas"), {
  ssr: false,
});

export default function StepOffDashboard() {
  const [running, setRunning] = useState(false);
  const bpm = useStepOffStore((state) => state.bpm);
  const currentTick = useStepOffStore((state) => state.currentTick);
  const activeSet = useStepOffStore((state) => state.activeSet);

  const beat = useMemo(() => Math.floor(currentTick / TICKS_PER_BEAT) + 1, [currentTick]);

  return (
    <div className="min-h-screen bg-base-300 text-base-content">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 md:p-6">
        <div className="card border border-base-100 bg-base-200 shadow-xl">
          <div className="card-body gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">StepOff Command Surface</p>
              <h1 className="text-2xl font-bold">Precision over polish.</h1>
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
                <div className="stat-value text-accent">{activeSet}</div>
              </div>
            </div>

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

              <span className={`badge ${running ? "badge-success" : "badge-neutral"}`}>
                {running ? "Audio Sync Active" : "Standing By"}
              </span>
            </div>
          </div>
        </div>

        <FieldCanvas />
      </div>
    </div>
  );
}
