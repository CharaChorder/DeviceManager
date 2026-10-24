import { describe, expect, it } from "vitest";
import { get, writable } from "svelte/store";
import { persistentWritable } from "./storage";

describe("persistentWritable", () => {
  it("should persist writes to localStorage", () => {
    const store = persistentWritable("test-persist", 1);
    store.set(42);
    expect(localStorage.getItem("test-persist")).toBe("42");
  });

  it("should load a persisted value", () => {
    localStorage.setItem("test-load", JSON.stringify({ a: 1 }));
    const store = persistentWritable("test-load", { a: 0 });
    expect(get(store)).toEqual({ a: 1 });
  });

  it("should fall back to the default on corrupt data", () => {
    localStorage.setItem("test-corrupt", "{not json");
    const store = persistentWritable("test-corrupt", "default");
    expect(get(store)).toBe("default");
  });

  it("should skip persisting when the condition is false", () => {
    const condition = writable(true);
    const store = persistentWritable("test-cond", "first", () =>
      get(condition),
    );
    store.set("kept");
    condition.set(false);
    store.set("ignored");
    expect(localStorage.getItem("test-cond")).toBe('"kept"');
  });
});
