import { ReplayPlayer } from "./player.js";
import type { Replay, ReplayEvent, TransmittableKeyEvent } from "./types.js";

function maybeRound<T>(value: T, round: boolean): T {
  return typeof value === "number" && round ? (Math.round(value) as T) : value;
}

export class ReplayRecorder {
  private held = new Map<string, [string, number]>();

  private heldHandles = new Map<
    string,
    ReturnType<ReplayPlayer["playLiveEvent"]>
  >();

  replay: ReplayEvent[] = [];

  private start = performance.now();

  private isFirstPress = true;

  player: ReplayPlayer;

  constructor(challenge?: Replay["challenge"]) {
    this.player = new ReplayPlayer({
      start: this.start,
      finish: this.start,
      keys: [],
      challenge,
    });
  }

  next(event: TransmittableKeyEvent) {
    if (this.isFirstPress) {
      this.player.startTime = event.timeStamp;
      this.isFirstPress = false;
    }
    this.player.replay.finish = event.timeStamp;
    if (event.type === "keydown") {
      this.held.set(event.code, [event.key, event.timeStamp]);
      this.heldHandles.set(
        event.code,
        this.player.playLiveEvent(event.key, event.code),
      );
    } else {
      const [key, start] = this.held.get(event.code) ?? ["", 0];
      const delta = event.timeStamp - start;
      this.held.delete(event.code);

      const element = Object.freeze([key, event.code, start, delta] as const);
      this.replay.push(element);
      this.heldHandles.get(event.code)?.(delta);
      this.heldHandles.delete(event.code);
    }
  }

  finish(trim = true, round = true) {
    return {
      start: maybeRound(trim ? this.replay[0]?.[2] : this.start, round) ?? 0,
      finish: maybeRound(
        trim
          ? Math.max(...this.replay.map((it) => it[2] + it[3]))
          : performance.now(),
        round,
      ),
      keys: this.replay
        .map(
          ([key, code, at, duration]) =>
            [
              key,
              code,
              maybeRound(at, round),
              maybeRound(duration, round),
            ] as const,
        )
        .sort((a, b) => a[2] - b[2]),
    } satisfies Replay;
  }
}
