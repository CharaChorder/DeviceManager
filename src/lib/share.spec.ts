import { describe, expect, it, vi } from "vitest";
import { canShare, share, triggerShare } from "$lib/share";
import { get } from "svelte/store";

describe("share", () => {
  it("is disabled until the share action is applied", () => {
    expect(get(canShare)).toBe(false);
  });

  it("registers the callback and routes triggerShare to it", () => {
    const callback = vi.fn();
    const action = share(window, callback);

    expect(get(canShare)).toBe(true);

    const event = new Event("share");
    triggerShare(event);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(event);

    action?.destroy?.();
    expect(get(canShare)).toBe(false);

    // after destroy the callback is detached: triggering is a no-op
    triggerShare(new Event("share"));
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
