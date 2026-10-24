import { describe, expect, it, vi } from "vitest";
import { ccosKeyInterceptor } from "./attachment";
import { ReplayRecorder } from "$lib/charrecorder/core/recorder";
import type { CharaDevice } from "$lib/serial/device";

/**
 * The CCOS key interceptor attaches capture-phase keyboard listeners to an
 * element: events are forwarded to the CCOS port and, when the port did
 * not prevent the default action, recorded into the replay recorder.
 */

function makePort(behavior: (event: KeyboardEvent) => void = () => {}) {
  const handleKeyEvent = vi.fn(behavior);
  const port = { port: { handleKeyEvent } } as unknown as CharaDevice;
  return { port, handleKeyEvent };
}

describe("ccosKeyInterceptor", () => {
  it("forwards events and records unhandled ones", () => {
    const { port, handleKeyEvent } = makePort();
    const recorder = new ReplayRecorder();
    const element = document.createElement("div");
    document.body.appendChild(element);

    const cleanup = ccosKeyInterceptor(port, recorder)(element);

    element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "a", code: "KeyA", bubbles: true }),
    );
    element.dispatchEvent(
      new KeyboardEvent("keyup", { key: "a", code: "KeyA", bubbles: true }),
    );

    expect(handleKeyEvent).toHaveBeenCalledTimes(2);
    const replay = recorder.finish();
    expect(replay.keys).toHaveLength(1);
    expect(replay.keys[0]).toEqual([
      "a",
      "KeyA",
      expect.any(Number),
      expect.any(Number),
    ]);

    cleanup();
    element.remove();
  });

  it("skips recording when the port prevented the default", () => {
    const { port } = makePort((event) => event.preventDefault());
    const recorder = new ReplayRecorder();
    const element = document.createElement("div");

    const cleanup = ccosKeyInterceptor(port, recorder)(element);

    element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "a", code: "KeyA", bubbles: true }),
    );

    expect(recorder.finish().keys).toHaveLength(0);
    cleanup();
  });

  it("does not attach anything without a CCOS port", () => {
    const recorder = new ReplayRecorder();
    const element = document.createElement("div");

    const cleanup = ccosKeyInterceptor(undefined, recorder)(element);

    element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "a", code: "KeyA", bubbles: true }),
    );

    expect(recorder.finish().keys).toHaveLength(0);
    cleanup();
  });

  it("detaches listeners on cleanup", () => {
    const { port, handleKeyEvent } = makePort();
    const recorder = new ReplayRecorder();
    const element = document.createElement("div");

    const cleanup = ccosKeyInterceptor(port, recorder)(element);
    cleanup();

    element.dispatchEvent(
      new KeyboardEvent("keydown", { key: "a", code: "KeyA", bubbles: true }),
    );
    expect(handleKeyEvent).not.toHaveBeenCalled();
  });
});
