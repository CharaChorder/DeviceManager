import { ROBOT_THRESHOLD } from "./player";
import type { LiveReplayEvent, ReplayEvent, TextToken } from "./types";

/**
 * This is the "heart" of the player logic
 */
export class ReplayStepper {
  held = new Map<string, boolean>();

  text: TextToken[];

  cursor = 0;

  challenge: TextToken[];

  ghostCount: number;

  mistakeCount = 0;

  constructor(initialReplay: ReplayEvent[] = [], challenge = "") {
    this.challenge = challenge.split("").map((text) => ({
      stamp: 0,
      duration: 0,
      code: "",
      text,
      source: "ghost",
      correct: true,
    }));
    this.text = [...this.challenge];
    this.ghostCount = this.challenge.length;
    for (const key of initialReplay) {
      this.step(...key);
    }
  }

  step(
    ...[output, code, at, duration]: ReplayEvent | LiveReplayEvent
  ): TextToken | undefined {
    let token: TextToken | undefined = undefined;
    if (output === "Backspace") {
      if (this.held.has("ControlLeft") || this.held.has("ControlRight")) {
        let wordIndex = 0;
        for (let i = this.cursor - 1; i >= 0; i--) {
          if (/\w+/.test(/** @type {TextToken} */ this.text[i]!.text)) {
            wordIndex = i;
          } else if (wordIndex !== 0) {
            break;
          }
        }
        this.text.splice(wordIndex, this.cursor - wordIndex);
      } else if (this.cursor !== 0) {
        this.text.splice(this.cursor - 1, 1);
      }
      this.cursor = Math.min(
        this.cursor,
        this.text.length - this.ghostCount + 1,
      );
    }
    if (output.length === 1) {
      token = {
        stamp: at,
        duration,
        code,
        text: output,
        source:
          duration === undefined
            ? undefined
            : duration < ROBOT_THRESHOLD
              ? "robot"
              : "human",
        correct: true,
      };
      this.text.splice(this.cursor, 0, token);
    }

    if (code === "ArrowLeft" || code === "Backspace") {
      this.cursor = Math.max(this.cursor - 1, 0);
    }
    if (code === "ArrowRight" || output.length === 1) {
      this.cursor = Math.min(
        this.cursor + 1,
        this.text.length - this.ghostCount,
      );
    }

    if (code === "Enter") {
      token = {
        stamp: at,
        code,
        duration,
        text: "\n",
        source:
          duration === undefined
            ? undefined
            : duration < ROBOT_THRESHOLD
              ? "robot"
              : "human",
        correct: true,
      };
      this.text.splice(this.cursor, 0, token);
      this.cursor++;
    }

    if (this.challenge.length > 0) {
      let challengeIndex = 0;
      this.mistakeCount = 0;
      for (let i = 0; i < this.text.length - this.ghostCount; i++) {
        if (this.text[i]!.text === this.challenge[challengeIndex]?.text) {
          this.text[i]!.correct = true;
        } else {
          this.mistakeCount++;
          this.text[i]!.correct = false;
        }
        challengeIndex++;
      }

      const currentGhostCount = this.ghostCount;
      this.ghostCount = Math.max(0, this.challenge.length - challengeIndex);

      this.text.splice(
        this.text.length - currentGhostCount,
        Math.max(0, currentGhostCount - this.ghostCount),
        ...this.challenge.slice(
          challengeIndex,
          challengeIndex + Math.max(0, this.ghostCount - currentGhostCount),
        ),
      );
    }

    return token;
  }
}
