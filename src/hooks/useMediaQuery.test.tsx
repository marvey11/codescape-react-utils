import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./useMediaQuery.js";

describe("useMediaQuery", () => {
  let changeHandler: (() => void) | undefined;
  let matching = false;

  beforeEach(() => {
    matching = false;
    changeHandler = undefined;
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        get matches() {
          return matching;
        },
        addEventListener: (_type: string, listener: () => void) => {
          changeHandler = listener;
        },
        removeEventListener: vi.fn(),
      })),
    );
  });

  it("reports and tracks media query changes", () => {
    const { result, unmount } = renderHook(() =>
      useMediaQuery("(min-width: 800px)"),
    );
    expect(result.current).toBe(false);
    matching = true;
    act(() => changeHandler?.());
    expect(result.current).toBe(true);
    unmount();
  });
});
