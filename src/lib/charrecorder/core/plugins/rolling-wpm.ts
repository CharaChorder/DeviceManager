import type { ReplayPlayer } from "../player";
import type { ReplayPlugin, StoreContract } from "../types";
import { avgWordLength } from "./wpm";

export class RollingWpmReplayPlugin
  implements StoreContract<number>, ReplayPlugin
{
  subscribers = new Set<(value: number) => void>();

  register(replay: ReplayPlayer) {
    replay.subscribe(() => {
      if (this.subscribers.size === 0) return;
      let i = 0;
      const index = Math.max(
        0,
        replay.stepper.text.findLastIndex((char) => {
          if (char.source === "ghost") return false;
          if (char.text === " " && i < 10) {
            i++;
          } else if (char.text === " ") {
            return true;
          }
          return false;
        }),
      );
      const length =
        replay.stepper.text.length - replay.stepper.ghostCount - index;
      const msPerChar =
        ((replay.stepper.text[
          replay.stepper.text.length - replay.stepper.ghostCount - 1
        ]?.stamp ?? 0) -
          (replay.stepper.text[index]?.stamp ?? 0)) /
        length;

      const value = 60_000 / (msPerChar * avgWordLength);
      if (Number.isFinite(value)) {
        for (const subscription of this.subscribers) {
          subscription(value);
        }
      }
    });
  }

  subscribe(subscription: (value: number) => void) {
    this.subscribers.add(subscription);
    return () => this.subscribers.delete(subscription);
  }
}
