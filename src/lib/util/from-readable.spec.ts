import { describe, expect, it } from "vitest";
import { get, writable } from "svelte/store";
import { fromReadable } from "./from-readable";

describe("fromReadable", () => {
  it("should replay the current value and updates", () => {
    const store = writable(1);
    const observable = fromReadable(store);
    const seen: number[] = [];
    const subscription = observable.subscribe((value) => seen.push(value));
    store.set(2);
    store.set(3);
    subscription.unsubscribe();
    store.set(4);
    expect(seen).toEqual([1, 2, 3]);
  });
});
