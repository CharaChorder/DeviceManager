import { describe, expect, it } from "vitest";
import { ReplayStepper } from "./step";
import { ROBOT_THRESHOLD } from "./player";
import type { ReplayEvent } from "./types";

const text = (stepper: ReplayStepper) =>
  stepper.text.map((it) => it.text).join("");

function type(stepper: ReplayStepper, chars: string, startAt = 0) {
  [...chars].forEach((char, i) => {
    const at = startAt + i * 100;
    stepper.step(char, `Key${char.toUpperCase()}`, at, 100);
  });
}

describe("ReplayStepper", () => {
  it("should insert typed characters and advance the cursor", () => {
    const stepper = new ReplayStepper();
    const token = stepper.step("a", "KeyA", 0, 100);
    expect(token?.text).toBe("a");
    expect(text(stepper)).toBe("a");
    expect(stepper.cursor).toBe(1);
  });

  it("should classify sources by the robot threshold", () => {
    const stepper = new ReplayStepper();
    const robot = stepper.step("a", "KeyA", 0, ROBOT_THRESHOLD - 1);
    const human = stepper.step("b", "KeyB", 10, ROBOT_THRESHOLD);
    expect(robot?.source).toBe("robot");
    expect(human?.source).toBe("human");
  });

  it("should insert newlines on Enter", () => {
    const stepper = new ReplayStepper();
    stepper.step("Enter", "Enter", 0, 100);
    expect(text(stepper)).toBe("\n");
  });

  it("should backspace the previous character", () => {
    const stepper = new ReplayStepper();
    type(stepper, "ab");
    stepper.step("Backspace", "Backspace", 300, 50);
    expect(text(stepper)).toBe("a");
  });

  it("should backspace the whole word with Ctrl held", () => {
    const stepper = new ReplayStepper();
    stepper.held.set("ControlLeft", true);
    type(stepper, "hi there");
    stepper.step("Backspace", "Backspace", 900, 50);
    expect(text(stepper)).toBe("hi ");
  });

  it("should move the cursor with the arrow keys", () => {
    const stepper = new ReplayStepper();
    type(stepper, "abc");
    stepper.step("ArrowLeft", "ArrowLeft", 400, 50);
    expect(stepper.cursor).toBe(2);
    stepper.step("ArrowRight", "ArrowRight", 500, 50);
    expect(stepper.cursor).toBe(3);
    stepper.step("ArrowLeft", "ArrowLeft", 600, 50);
    stepper.step("Backspace", "Backspace", 700, 50);
    expect(text(stepper)).toBe("ac");
  });

  it("should replay an initial event list", () => {
    const events: ReplayEvent[] = [
      ["a", "KeyA", 0, 100],
      ["b", "KeyB", 100, 100],
    ];
    const stepper = new ReplayStepper(events);
    expect(text(stepper)).toBe("ab");
  });

  describe("with a challenge", () => {
    it("should start with ghost tokens", () => {
      const stepper = new ReplayStepper([], "abc");
      expect(text(stepper)).toBe("abc");
      expect(stepper.ghostCount).toBe(3);
    });

    it("should mark correct input and shrink the ghosts", () => {
      const stepper = new ReplayStepper([], "abc");
      type(stepper, "a");
      expect(stepper.ghostCount).toBe(2);
      expect(stepper.text[0]!.source).toBe("human");
      expect(stepper.text[0]!.correct).toBe(true);
    });

    it("should count mistakes", () => {
      const stepper = new ReplayStepper([], "abc");
      type(stepper, "x");
      expect(stepper.mistakeCount).toBe(1);
      expect(stepper.text[0]!.correct).toBe(false);
    });

    it("should complete the challenge when fully typed", () => {
      const stepper = new ReplayStepper([], "ab");
      type(stepper, "ab");
      expect(stepper.ghostCount).toBe(0);
      expect(stepper.mistakeCount).toBe(0);
      expect(text(stepper)).toBe("ab");
    });
  });
});
