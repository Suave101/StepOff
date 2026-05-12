"use client";

import * as Tone from "tone";

import type { TempoMap } from "@/lib/audio/MidiParser";
import { useStepOffStore } from "@/lib/useStore";

class AudioController {
  private beatEventId: number | null = null;

  private tempoEventIds: number[] = [];

  private initialized = false;

  async initialize() {
    if (this.initialized) {
      return;
    }

    Tone.Transport.bpm.value = useStepOffStore.getState().bpm;
    this.beatEventId = Tone.Transport.scheduleRepeat((time) => {
      const beats = Math.floor(Tone.Transport.getTicksAtTime(time) / Tone.Transport.PPQ);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[StepOff] Display Beat ${beats + 1} (internal ${beats})`);
      }
    }, "4n");

    this.initialized = true;
  }

  setBpm(nextBpm: number) {
    const bpm = Math.min(240, Math.max(40, nextBpm));
    Tone.Transport.bpm.rampTo(bpm, 0.05);
    useStepOffStore.getState().setBpm(bpm);
  }

  loadTempoMap(tempoMap: TempoMap) {
    this.tempoEventIds.forEach((eventId) => Tone.Transport.clear(eventId));
    this.tempoEventIds = [];

    Tone.Transport.PPQ = tempoMap.ppq;

    tempoMap.events.forEach((event) => {
      const id = Tone.Transport.schedule((time) => {
        Tone.Transport.bpm.setValueAtTime(event.bpm, time);
        Tone.Transport.timeSignature = event.timeSignature;
      }, `${event.tick}i`);
      this.tempoEventIds.push(id);
    });
  }

  async start() {
    await Tone.start();
    await this.initialize();

    if (Tone.Transport.state !== "started") {
      Tone.Transport.start();
    }
  }

  stop() {
    Tone.Transport.stop();
    Tone.Transport.seconds = 0;
    useStepOffStore.getState().setTransportTick(0);
  }

  dispose() {
    if (this.beatEventId !== null) {
      Tone.Transport.clear(this.beatEventId);
      this.beatEventId = null;
    }

    this.tempoEventIds.forEach((eventId) => Tone.Transport.clear(eventId));
    this.tempoEventIds = [];
    this.initialized = false;
  }
}

export const audioController = new AudioController();
