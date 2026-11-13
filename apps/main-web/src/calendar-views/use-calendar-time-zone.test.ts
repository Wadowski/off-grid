// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../test-support/json-response.js";
import { useCalendarTimeZone } from "./use-calendar-time-zone.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCalendarTimeZone", () => {
  it("uses the zone the person set", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ status: 200, body: { timeZone: "Europe/Warsaw", isSet: true } }),
      ),
    );

    const { result } = renderHook(() => useCalendarTimeZone(true));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.timeZone).toBe("Europe/Warsaw");
  });

  it("falls back to UTC when no zone is set", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: 200, body: { timeZone: "UTC", isSet: false } })),
    );

    const { result } = renderHook(() => useCalendarTimeZone(true));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.timeZone).toBe("UTC");
  });

  it("does not request the zone while disabled", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderHook(() => useCalendarTimeZone(false));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports failure and uses UTC when the zone cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: 500, body: { code: "INTERNAL", message: "boom" } })),
    );

    const { result } = renderHook(() => useCalendarTimeZone(true));

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.timeZone).toBe("UTC");
  });
});
