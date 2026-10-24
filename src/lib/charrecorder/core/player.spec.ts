import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReplayPlayer } from "./player";
import { ReplayRecorder } from "./recorder";
import type { Replay, TransmittableKeyEvent } from "./types";

const key = (
  type: "keydown" | "keyup",
  code: string,
  key: string,
  timeStamp: number,
): TransmittableKeyEvent => ({ type, code, key, timeStamp });

describe("ReplayPlayer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should emit tokens as the replay timeline advances", async () => {
    const replay: Replay = {
      start: 0,
      finish: 200,
      keys: [
        ["a", "KeyA", 0, 50],
        ["b", "KeyB", 100, 50],
      ],
    };
    const player = new ReplayPlayer(replay);
    const tokens: (string | undefined)[] = [];
    player.subscribe((token) => tokens.push(token?.text));
    const done = vi.fn();
    player.onDone = done;

    player.start(0);
    vi.advanceTimersByTime(250);
    player.destroy();

    expect(tokens).toContain("a");
    expect(tokens).toContain("b");
    expect(done).toHaveBeenCalledOnce();
  });

  it("should finish immediately for an empty replay", () => {
    const player = new ReplayPlayer({ start: 0, finish: 0, keys: [] });
    const done = vi.fn();
    player.onDone = done;
    player.start(0);
    expect(done).toHaveBeenCalledOnce();
    player.destroy();
  });

  it("should live-type with a robot/human flip at the threshold", () => {
    const player = new ReplayPlayer({ start: 0, finish: 0, keys: [] });
    const tokens: (typeof player extends {
      subscribe: (f: (t: infer T) => void) => any;
    }
      ? T
      : never)[] = [];
    player.subscribe((token) => tokens.push(token));

    // playLiveEvent returns the release callback, the token comes via the store
    const release = player.playLiveEvent("a", "KeyA");
    expect(tokens.at(-1)?.text).toBe("a");
    // source is undecided while the key is held
    expect(tokens.at(-1)?.source).toBeUndefined();

    release(10);
    expect(player.stepper.text.at(-1)?.source).toBe("robot");
    player.destroy();
  });

  it("should flip a live key to human when held past the threshold", () => {
    const player = new ReplayPlayer({ start: 0, finish: 0, keys: [] });
    const release = player.playLiveEvent("a", "KeyA");
    vi.advanceTimersByTime(50);
    // the held flip happens in the delayed subscription
    release(60);
    expect(player.stepper.text.at(-1)?.source).toBe("human");
    player.destroy();
  });
});

describe("ReplayRecorder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should pair keydown/keyup into events with durations", () => {
    const recorder = new ReplayRecorder();
    recorder.next(key("keydown", "KeyA", "a", 100));
    recorder.next(key("keyup", "KeyA", "a", 160));

    const replay = recorder.finish();
    expect(replay.keys).toEqual([["a", "KeyA", 100, 60]]);
    expect(replay.start).toBe(100);
    expect(replay.finish).toBe(160);
  });

  it("should sort keys by press time", () => {
    const recorder = new ReplayRecorder();
    recorder.next(key("keydown", "KeyB", "b", 300));
    recorder.next(key("keydown", "KeyA", "a", 100));
    recorder.next(key("keyup", "KeyA", "a", 150));
    recorder.next(key("keyup", "KeyB", "b", 350));

    const replay = recorder.finish();
    expect(replay.keys.map((it) => it[2])).toEqual([100, 300]);
    expect(replay.start).toBe(100);
    expect(replay.finish).toBe(350);
  });

  it("should feed the live player on keydown", () => {
    const recorder = new ReplayRecorder("hi");
    const seen: string[] = [];
    recorder.player.subscribe((token) => token && seen.push(token.text));
    recorder.next(key("keydown", "KeyH", "h", 100));
    recorder.next(key("keyup", "KeyH", "h", 120));
    expect(seen).toContain("h");
    recorder.player.destroy();
  });

  it("should pass the challenge to the player", () => {
    const recorder = new ReplayRecorder("abc");
    expect(recorder.player.replay.challenge).toBe("abc");
    recorder.player.destroy();
  });

  it("should round fractional timestamps by default", () => {
    const recorder = new ReplayRecorder();
    recorder.next(key("keydown", "KeyA", "a", 100.4));
    recorder.next(key("keyup", "KeyA", "a", 160.6));
    const replay = recorder.finish();
    expect(replay.keys[0]).toEqual(["a", "KeyA", 100, 60]);
  });
});
