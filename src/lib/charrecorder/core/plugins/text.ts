import type { ReplayPlayer } from "../player";
import type { ReplayPlugin, StoreContract } from "../types";

export class TextPlugin implements StoreContract<string>, ReplayPlugin {
  private subscribers = new Set<(value: string) => void>();

  register(replay: ReplayPlayer) {
    replay.subscribe(() => {
      if (this.subscribers.size === 0) return;
      const text = replay.stepper.text
        .filter((it) => it.source !== "ghost")
        .map((it) => it.text)
        .join("");
      for (const subscription of this.subscribers) {
        subscription(text);
      }
    });
  }
  subscribe(subscription: (value: string) => void) {
    this.subscribers.add(subscription);
    return () => this.subscribers.delete(subscription);
  }
}
