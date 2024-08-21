import { ReplayPlayer, ROBOT_THRESHOLD } from "../player";
import type {
  StoreContract,
  ReplayPlugin,
  InferredChord,
  TextToken,
} from "../types";

function isValid(human: TextToken[], robot: TextToken[]) {
  return human.length > 1 && human.length <= 10 && robot.length > 0;
}

export class ChordsReplayPlugin
  implements StoreContract<InferredChord[]>, ReplayPlugin
{
  private readonly subscribers = new Set<(value: InferredChord[]) => void>();

  private readonly chords: InferredChord[] = [];

  private tokens: TextToken[] = [];

  private timeout: Parameters<typeof clearTimeout>[0] = NaN;

  private infer(human: TextToken[], robo: TextToken[]) {
    const output = robo
      .filter((token) => token.text.length === 1)
      .map((token) => token.text)
      .join("");
    this.chords.push({
      id: human.reduce((acc, curr) => Math.max(acc, curr.stamp), 0),
      input: human,
      output,
      deviation: [
        human.reduce((acc, curr) => Math.max(acc, curr.stamp), 0) -
          human.reduce((acc, curr) => Math.min(acc, curr.stamp), Infinity),
        human.reduce(
          (acc, curr) => Math.max(acc, curr.stamp + (curr.duration ?? 0)),
          0,
        ) -
          human.reduce(
            (acc, curr) => Math.min(acc, curr.stamp + (curr.duration ?? 0)),
            Infinity,
          ),
      ],
    });

    for (const subscription of this.subscribers) {
      subscription(this.chords);
    }
  }

  register(replay: ReplayPlayer) {
    replay.subscribe((token) => {
      if (token) {
        this.tokens.push(token);
      }

      let last = NaN;
      let roboStart = NaN;
      let roboEnd = NaN;
      for (let i = 0; i < this.tokens.length; i++) {
        const token = this.tokens[i]!;
        if (!token.duration || !token.source) break;

        if (
          Number.isNaN(roboStart) &&
          token.source === "human" &&
          token.stamp > last
        ) {
          this.tokens = [];
        }

        if (Number.isNaN(last) || token.stamp + token.duration > last) {
          last = token.stamp + token.duration;
        }

        if (Number.isNaN(roboStart) && token.source === "robot") {
          roboStart = i;
        } else if (!Number.isNaN(roboStart) && token.source === "human") {
          roboEnd = i;
          const human = this.tokens.splice(0, roboStart);
          const robot = this.tokens.splice(0, roboEnd - roboStart);
          if (isValid(human, robot)) {
            this.infer(human, robot);
          }
        }
      }
      console.log(this.tokens);

      clearTimeout(this.timeout);
      if (replay.stepper.held.size === 0) {
        this.timeout = setTimeout(() => {
          if (this.tokens.length > 0) {
            const human = this.tokens.splice(
              0,
              this.tokens.findIndex((it) => it.source === "robot"),
            );
            const robot = this.tokens.splice(0, this.tokens.length);
            if (isValid(human, robot)) {
              this.infer(human, robot);
            }
          }
        }, ROBOT_THRESHOLD);
      }
    });
  }

  subscribe(subscription: (value: InferredChord[]) => void) {
    this.subscribers.add(subscription);
    return () => this.subscribers.delete(subscription);
  }
}
