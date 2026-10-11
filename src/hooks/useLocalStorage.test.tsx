import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalStorage } from "./useLocalStorage.js";

describe("useLocalStorage", () => {
  beforeEach(() => localStorage.clear());

  it("uses the initial value, persists updates, and supports updater functions", () => {
    const { result } = renderHook(() => useLocalStorage("count", 1));
    expect(result.current[0]).toBe(1);

    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(localStorage.getItem("count")).toBe("2");

    act(() => result.current[1]((count) => count + 1));
    expect(result.current[0]).toBe(3);
  });

  it("reads stored values and falls back for invalid JSON", () => {
    localStorage.setItem("saved", JSON.stringify({ ready: true }));
    const { result } = renderHook(() =>
      useLocalStorage("saved", { ready: false }),
    );
    expect(result.current[0]).toEqual({ ready: true });

    localStorage.setItem("bad", "not-json");
    const invalid = renderHook(() => useLocalStorage("bad", "fallback"));
    expect(invalid.result.current[0]).toBe("fallback");
  });

  it("syncs storage events and removes the value", () => {
    const { result } = renderHook(() => useLocalStorage("shared", "initial"));
    localStorage.setItem("shared", JSON.stringify("remote"));
    act(() =>
      window.dispatchEvent(new StorageEvent("storage", { key: "shared" })),
    );
    expect(result.current[0]).toBe("remote");

    act(() => result.current[2]());
    expect(result.current[0]).toBe("initial");
    expect(localStorage.getItem("shared")).toBeNull();
  });

  it("ignores unrelated storage events and reads the active key after it changes", () => {
    localStorage.setItem("other", JSON.stringify("from other key"));
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, "initial"),
      { initialProps: { key: "first" } },
    );

    act(() =>
      window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" })),
    );
    expect(result.current[0]).toBe("initial");

    rerender({ key: "other" });
    expect(result.current[0]).toBe("from other key");
  });

  it("keeps updates in memory when local storage writes fail", () => {
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("Storage unavailable");
      });
    const { result } = renderHook(() => useLocalStorage("private", "start"));

    act(() => result.current[1]("updated"));
    expect(result.current[0]).toBe("updated");
    setItem.mockRestore();
  });
});
