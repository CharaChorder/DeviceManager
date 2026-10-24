import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReplayPlayer, ROBOT_THRESHOLD } from "../player";
import type { Replay } from "../types";
import { ChordsReplayPlugin } from "./chords";
import { MetaReplayPlugin } from "./meta";
import { RollingWpmReplayPlugin } from "./rolling-wpm";
import { TextPlugin } from "./text";
import { avgWordLength, WpmReplayPlugin } from "./wpm";

/**
 * Replay plugin contracts: every plugin subscribes to the player's token
 * stream and exposes a derived store. Fixtures drive the player over a
 * scripted replay timeline with fake timers.
 */

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

function play(player: ReplayPlayer, ms: number) {
  player.start(0);
  vi.advanceTimersByTime(ms);
  player.destroy();
}

describe("TextPlugin", () => {
  it("publishes the typed text without ghosts", () => {
    const replay: Replay = {
      start: 0,
      finish: 60,
      keys: [
        ["a", "KeyA", 0, 30],
        ["b", "KeyB", 20, 30],
      ],
      challenge: "abc",
    };
    const plugin = new TextPlugin();
    const player = new ReplayPlayer(replay, [plugin]);
    const seen: string[] = [];
    plugin.subscribe((it) => seen.push(it));

    play(player, 100);

    expect(seen.length).toBeGreaterThan(0);
    expect(seen.at(-1)).toBe("ab");
  });

  it("stays silent without subscribers", () => {
    const replay: Replay = {
      start: 0,
      finish: 10,
      keys: [["a", "KeyA", 0, 30]],
    };
    const plugin = new TextPlugin();
    const player = new ReplayPlayer(replay, [plugin]);
    play(player, 100);
    // no subscribers: nothing computed, subscription API intact
    const seen: string[] = [];
    const unsubscribe = plugin.subscribe((it) => seen.push(it));
    unsubscribe();
    expect(seen).toEqual([]);
  });
});

describe("WpmReplayPlugin", () => {
  it("computes average words per minute", () => {
    // 4 chars ending at 150ms → 37.5ms per char
    const replay: Replay = {
      start: 0,
      finish: 200,
      keys: [
        ["a", "KeyA", 0, 30],
        ["b", "KeyB", 50, 30],
        ["c", "KeyC", 100, 30],
        ["d", "KeyD", 150, 30],
      ],
    };
    const plugin = new WpmReplayPlugin();
    const player = new ReplayPlayer(replay, [plugin]);
    const seen: number[] = [];
    plugin.subscribe((it) => seen.push(it));

    play(player, 300);

    expect(seen.at(-1)).toBe(60_000 / (37.5 * avgWordLength));
  });
});

describe("RollingWpmReplayPlugin", () => {
  it("measures speed over the last ten words", () => {
    // 12 single-letter words, 20ms per character, stamps 0..220
    const chars = "a a a a a a a a a a a a";
    const keys = chars
      .split("")
      .map((text, i) => [text, "KeyA", i * 20, 10] as const);
    const replay: Replay = { start: 0, finish: 240, keys };
    const plugin = new RollingWpmReplayPlugin();
    const player = new ReplayPlayer(replay, [plugin]);
    const seen: number[] = [];
    plugin.subscribe((it) => seen.push(it));

    play(player, 400);

    // window: the last space is dropped from the count, the window starts
    // after the second space (index 2, stamp 40) and spans 21 chars
    const expected = 60_000 / (((440 - 40) / 21) * avgWordLength);
    expect(seen.at(-1)).toBe(expected);
  });

  it("emits nothing while the window is degenerate", () => {
    const replay: Replay = {
      start: 0,
      finish: 10,
      keys: [["a", "KeyA", 0, 10]],
    };
    const plugin = new RollingWpmReplayPlugin();
    const player = new ReplayPlayer(replay, [plugin]);
    const seen: number[] = [];
    plugin.subscribe((it) => seen.push(it));

    play(player, 100);

    // single char: msPerChar 0 → infinite WPM → filtered out
    expect(seen).toEqual([]);
  });
});

describe("ChordsReplayPlugin", () => {
  it("infers a chord from human keys followed by robot output", () => {
    const replay: Replay = {
      start: 0,
      finish: 70,
      keys: [
        ["h", "KeyH", 0, 40],
        ["i", "KeyI", 10, 40],
        ["!", "Key1", 60, 5], // robot: below the threshold
      ],
    };
    const plugin = new ChordsReplayPlugin();
    const player = new ReplayPlayer(replay, [plugin]);
    const seen: { id: number; output: string; deviation: [number, number] }[] =
      [];
    plugin.subscribe((chords) => {
      const last = chords.at(-1);
      if (last)
        seen.push({
          id: last.id,
          output: last.output,
          deviation: last.deviation,
        });
    });

    play(player, 200);

    expect(seen).toHaveLength(1);
    expect(seen[0]!.output).toBe("!");
    expect(seen[0]!.id).toBe(10);
    expect(seen[0]!.deviation).toEqual([10, 10]);
  });

  it("infers immediately when a new human key closes the robot run", () => {
    const replay: Replay = {
      start: 0,
      finish: 120,
      keys: [
        ["h", "KeyH", 0, 40],
        ["i", "KeyI", 10, 40],
        ["!", "Key1", 60, 5],
        ["x", "KeyX", 80, 40],
      ],
    };
    const plugin = new ChordsReplayPlugin();
    const player = new ReplayPlayer(replay, [plugin]);
    const chords: { output: string }[] = [];
    plugin.subscribe((it) => {
      chords.length = 0;
      chords.push(...it.map((c) => ({ output: c.output })));
    });

    play(player, 200);

    expect(chords).toHaveLength(1);
    expect(chords[0]!.output).toBe("!");
  });

  it("ignores single-key inputs (not a chord)", () => {
    const replay: Replay = {
      start: 0,
      finish: 70,
      keys: [
        ["h", "KeyH", 0, 40],
        ["!", "Key1", 60, 5],
      ],
    };
    const plugin = new ChordsReplayPlugin();
    const player = new ReplayPlayer(replay, [plugin]);
    const inferred: unknown[][] = [];
    plugin.subscribe((it) => inferred.push(it));

    play(player, 200);

    expect(inferred).toEqual([]);
  });

  it("requires the input window to be at most ten keys", () => {
    const longInput = Array.from(
      { length: 11 },
      (_, i) => [`${i}`, `Key${i}`, i, 40] as const,
    );
    const replay: Replay = {
      start: 0,
      finish: 200,
      keys: [...longInput, ["!", "Key1", 160, 5]],
    };
    const plugin = new ChordsReplayPlugin();
    const player = new ReplayPlayer(replay, [plugin]);
    const inferred: unknown[][] = [];
    plugin.subscribe((it) => inferred.push(it));

    play(player, 300);

    expect(inferred).toEqual([]);
  });
});

describe("MetaReplayPlugin", () => {
  it("groups overlapping key tokens and tracks min/max", () => {
    const replay: Replay = {
      start: 0,
      finish: 120,
      keys: [
        ["a", "KeyA", 0, 200],
        ["b", "KeyB", 50, 30],
        ["c", "KeyC", 300, 10],
      ],
    };
    const plugin = new MetaReplayPlugin();
    const player = new ReplayPlayer(replay, [plugin]);
    let graph = undefined as
      | undefined
      | {
          min: [number, number];
          max: [number, number];
          tokens: unknown[][];
        };
    plugin.subscribe((it) => (graph = it));

    play(player, 400);

    expect(graph).toBeDefined();
    // min tracks the start of the newest single-token generation: a+b
    // merge into one group starting at b's stamp
    expect(graph!.min).toEqual([50, 0]);
    // a (0..200) overlaps b (50..80); c starts fresh at 300
    expect(graph!.tokens.map((it) => it.length)).toEqual([2, 1]);
    expect(graph!.max).toEqual([310, 2]);
  });

  it("flips an undecided live key to human after the threshold", () => {
    const plugin = new MetaReplayPlugin();
    const player = new ReplayPlayer({ start: 0, finish: 0, keys: [] }, [
      plugin,
    ]);

    const release = player.playLiveEvent("x", "KeyX");
    expect(player.stepper.text.at(-1)!.source).toBeUndefined();

    vi.advanceTimersByTime(ROBOT_THRESHOLD + 5);

    expect(player.stepper.text.at(-1)!.source).toBe("human");
    release(50);
    player.destroy();
  });
});
