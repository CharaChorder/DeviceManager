import type { ReplayPlayer } from "../player";
import type { ReplayPlugin, StoreContract } from "../types";

export const avgWordLength = 5;

export class WpmReplayPlugin implements StoreContract<number>, ReplayPlugin {
  private subscribers = new Set<(value: number) => void>();

  register(replay: ReplayPlayer) {
    replay.subscribe(() => {
      if (this.subscribers.size === 0) return;
      const msPerChar =
        ((replay.stepper.text.at(-1)?.stamp ?? 0) - replay.startTime) /
        replay.stepper.text.length;

      const value = 60_000 / (msPerChar * avgWordLength);
      for (const subscription of this.subscribers) {
        subscription(value);
      }
    });
  }
  subscribe(subscription: (value: number) => void) {
    this.subscribers.add(subscription);
    return () => this.subscribers.delete(subscription);
  }
}
