import { ReplayPlayer, ROBOT_THRESHOLD } from "../player";
import type { GraphData, ReplayPlugin, StoreContract } from "../types";

export class MetaReplayPlugin
  implements StoreContract<GraphData>, ReplayPlugin
{
  private subscribers = new Set<(value: GraphData) => void>();

  private graphData: GraphData = { min: [0, 0], max: [0, 0], tokens: [] };

  private liveHeldRoboFilter = new Set<string>();

  register(replay: ReplayPlayer) {
    replay.subscribe((token) => {
      if (!token) return;
      const lastHeld = this.graphData.tokens
        .at(-1)
        ?.reduce(
          (acc, curr) => Math.max(acc, curr.stamp + (curr.duration ?? 0)),
          0,
        );
      if (
        lastHeld &&
        (lastHeld === -1 || lastHeld > token.stamp + (token.duration ?? 0))
      ) {
        this.graphData.tokens.at(-1)!.push(token);
      } else {
        this.graphData.tokens.push([token]);
      }
      if (this.graphData.tokens.length === 1) {
        this.graphData.min = [token.stamp, 0];
      }
      this.graphData.max = [
        this.graphData.tokens
          .at(-1)!
          .reduce(
            (acc, { stamp, duration }) =>
              Math.max(acc, stamp + (duration ?? 0)),
            0,
          ),
        Math.max(this.graphData.max[1], this.graphData.tokens.at(-1)!.length),
      ];

      this.liveHeldRoboFilter.add(token.code);

      if (token.duration === undefined) {
        setTimeout(() => {
          if (this.liveHeldRoboFilter.has(token.code)) {
            token.source = "human";
            for (const subscription of this.subscribers) {
              subscription(this.graphData);
            }
          }
        }, ROBOT_THRESHOLD);
      } else {
        setTimeout(() => {
          this.liveHeldRoboFilter.delete(token.code);
        }, token.duration);
      }

      for (const subscription of this.subscribers) {
        subscription(this.graphData);
      }
    });
  }

  subscribe(subscription: (value: GraphData) => void) {
    this.subscribers.add(subscription);
    return () => this.subscribers.delete(subscription);
  }
}
