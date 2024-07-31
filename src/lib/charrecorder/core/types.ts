import { ReplayPlayer } from "./player.js";

export interface Replay {
  start: number;
  finish: number;
  keys: ReplayEvent[];
  challenge?: string;
}
export type LiveReplayEvent = readonly [
  output: string,
  code: string,
  at: number,
];
export type ReplayEvent = readonly [...LiveReplayEvent, duration: number];

export interface TextToken {
  stamp: number;
  duration?: number;
  text: string;
  code: string;
  source?: "human" | "robot" | "ghost";
  correct: boolean;
}

export interface GraphData {
  min: [number, number];
  max: [number, number];
  tokens: TextToken[][];
}

export interface ReplayStepResult {
  text: TextToken[];
  cursor: number;
  challengeCursor: number;
  token: TextToken | undefined;
}

export type TransmittableKeyEvent = Pick<
  KeyboardEvent,
  "timeStamp" | "type" | "code" | "key"
>;

export interface InferredChord {
  id: number;
  input: TextToken[];
  output: string;
  deviation: [number, number];
}

export interface ReplayPlugin {
  register(replay: ReplayPlayer): void;
}

export interface StoreContract<T> {
  subscribe(subscription: (value: T) => void): () => void;

  set?: (value: T) => void;
}
