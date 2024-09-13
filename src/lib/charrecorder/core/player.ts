import { ReplayStepper } from "./step";
import type { ReplayPlugin, Replay, TextToken } from "./types";

export const ROBOT_THRESHOLD = 20;

export class ReplayPlayer {
  stepper = new ReplayStepper();

  private replayCursor = 0;

  private releaseAt = new Map<string, number>();

  startTime = performance.now();

  private animationFrameId: number | null = null;

  timescale = 1;

  private subscribers = new Set<(value: TextToken | undefined) => void>();

  onDone?: () => void;

  constructor(
    readonly replay: Replay,
    plugins: ReplayPlugin[] = [],
  ) {
    for (const plugin of plugins) {
      plugin.register(this);
    }
  }

  /** @type {import('./types').StoreContract<import('./types').TextToken | undefined>['subscribe']} */
  subscribe(subscription: (value: TextToken | undefined) => void) {
    this.subscribers.add(subscription);
    return () => this.subscribers.delete(subscription);
  }

  private updateLoop() {
    if (
      this.replayCursor >= this.replay.keys.length &&
      this.releaseAt.size === 0
    ) {
      if (this.onDone) {
        this.onDone();
      }
      return;
    }

    const now = performance.now() - this.startTime;

    while (
      this.replayCursor < this.replay.keys.length &&
      this.replay.keys[this.replayCursor]![2] * this.timescale -
        this.replay.start <=
        now
    ) {
      const [key, code, at, duration] = this.replay.keys[this.replayCursor++]!;
      this.stepper.held.set(code, duration > ROBOT_THRESHOLD);
      this.releaseAt.set(code, now + duration * this.timescale);

      const token = this.stepper.step(key, code, at, duration);

      for (const subscription of this.subscribers) {
        subscription(token);
      }
    }

    for (const [key, releaseAt] of this.releaseAt) {
      if (releaseAt > now) continue;
      this.stepper.held.delete(key);
      this.releaseAt.delete(key);

      for (const subscription of this.subscribers) {
        subscription(undefined);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.updateLoop.bind(this));
  }

  playLiveEvent(key: string, code: string): (duration: number) => void {
    this.replay.start = this.startTime;
    const at = performance.now();
    this.stepper.held.set(code, false);

    const token = this.stepper.step(key, code, at) ?? {
      text: key,
      code,
      stamp: at,
      correct: true,
      source: "robot",
    };

    for (const subscription of this.subscribers) {
      subscription(token);
    }

    const timeout = setTimeout(() => {
      token.source = "human";
      this.stepper.held.set(code, true);
      for (const subscription of this.subscribers) {
        subscription(undefined);
      }
    }, ROBOT_THRESHOLD);

    return (duration) => {
      clearTimeout(timeout);
      if (token) {
        // TODO: will this cause performance issues with long text?
        const index = this.stepper.text.indexOf(token);
        if (index >= 0) {
          this.stepper.text[index]!.duration = duration;
          this.stepper.text[index]!.source =
            duration < ROBOT_THRESHOLD ? "robot" : "human";
        }
      }
      this.stepper.held.delete(code);

      for (const subscription of this.subscribers) {
        subscription(undefined);
      }
    };
  }

  start(delay = 200): this {
    this.replayCursor = 0;
    this.stepper = new ReplayStepper([], this.replay.challenge);
    if (this.replay.keys.length === 0) {
      if (this.onDone) {
        this.onDone();
      }
      return this;
    }
    setTimeout(() => {
      this.startTime = performance.now();
      this.animationFrameId = requestAnimationFrame(this.updateLoop.bind(this));
    }, delay);
    return this;
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
