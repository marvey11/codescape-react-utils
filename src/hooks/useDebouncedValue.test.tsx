import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./useDebouncedValue.js";

describe("useDebouncedValue", () => {
  afterEach(() => vi.useRealTimers());

  it("updates only after the delay and cancels stale updates", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 200),
      {
        initialProps: { value: "first" },
      },
    );

    rerender({ value: "second" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: "third" });
    act(() => vi.advanceTimersByTime(199));
    expect(result.current).toBe("first");
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("third");
  });
});
