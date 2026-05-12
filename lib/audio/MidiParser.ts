export type TempoMapEvent = {
  tick: number;
  bpm: number;
  timeSignature: [number, number];
};

export type TempoMap = {
  ppq: number;
  events: TempoMapEvent[];
};

const readVariableLength = (bytes: Uint8Array, offset: number) => {
  let value = 0;
  let index = offset;
  let currentByte = 0;

  do {
    currentByte = bytes[index];
    value = (value << 7) | (currentByte & 0x7f);
    index += 1;
  } while ((currentByte & 0x80) !== 0 && index < bytes.length);

  return { value, nextOffset: index };
};

export const parseMidiToTempoMap = (midiBuffer: ArrayBuffer): TempoMap => {
  const bytes = new Uint8Array(midiBuffer);

  if (bytes.length < 14 || new TextDecoder().decode(bytes.slice(0, 4)) !== "MThd") {
    return {
      ppq: 960,
      events: [{ tick: 0, bpm: 120, timeSignature: [4, 4] }],
    };
  }

  const division = (bytes[12] << 8) | bytes[13];
  const ppq = division & 0x7fff;
  const events: TempoMapEvent[] = [{ tick: 0, bpm: 120, timeSignature: [4, 4] }];

  let offset = 14;

  while (offset + 8 <= bytes.length) {
    const chunkType = new TextDecoder().decode(bytes.slice(offset, offset + 4));
    const chunkLength =
      (bytes[offset + 4] << 24) |
      (bytes[offset + 5] << 16) |
      (bytes[offset + 6] << 8) |
      bytes[offset + 7];
    offset += 8;

    if (chunkType !== "MTrk") {
      offset += chunkLength;
      continue;
    }

    const trackEnd = offset + chunkLength;
    let trackTick = 0;
    let runningStatus = 0;
    let currentTimeSignature: [number, number] = [4, 4];

    while (offset < trackEnd) {
      const { value: delta, nextOffset } = readVariableLength(bytes, offset);
      offset = nextOffset;
      trackTick += delta;

      let status = bytes[offset];
      if ((status & 0x80) === 0) {
        status = runningStatus;
      } else {
        offset += 1;
        runningStatus = status;
      }

      if (status === 0xff) {
        const metaType = bytes[offset];
        const lengthInfo = readVariableLength(bytes, offset + 1);
        const dataStart = lengthInfo.nextOffset;
        const dataEnd = dataStart + lengthInfo.value;

        if (metaType === 0x51 && lengthInfo.value === 3) {
          const microsecondsPerQuarter =
            (bytes[dataStart] << 16) |
            (bytes[dataStart + 1] << 8) |
            bytes[dataStart + 2];
          const bpm = Number((60000000 / microsecondsPerQuarter).toFixed(4));

          events.push({
            tick: trackTick,
            bpm,
            timeSignature: currentTimeSignature,
          });
        }

        if (metaType === 0x58 && lengthInfo.value >= 2) {
          const numerator = bytes[dataStart];
          const denominator = 2 ** bytes[dataStart + 1];
          currentTimeSignature = [numerator, denominator];
          events.push({
            tick: trackTick,
            bpm: events.at(-1)?.bpm ?? 120,
            timeSignature: currentTimeSignature,
          });
        }

        offset = dataEnd;
        continue;
      }

      if (status === 0xf0 || status === 0xf7) {
        const lengthInfo = readVariableLength(bytes, offset);
        offset = lengthInfo.nextOffset + lengthInfo.value;
        continue;
      }

      const eventType = status & 0xf0;
      const dataBytes = eventType === 0xc0 || eventType === 0xd0 ? 1 : 2;
      offset += dataBytes;
    }
  }

  events.sort((a, b) => a.tick - b.tick);

  return {
    ppq: ppq || 960,
    events,
  };
};
