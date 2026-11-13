// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../test-support/json-response.js";
import { useCalendarView } from "./use-calendar-view.js";

const EMPTY_AGENDA = {
  view: "agenda",
  startDate: "2025-10-20",
  endDate: "2025-10-26",
  days: [{ date: "2025-10-23", events: [] }],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCalendarView", () => {
  it("loads the days of the view and asks for the Monday of the agenda week", async () => {
    const fetchMock = vi.fn<(url: string) => Promise<Response>>(async () =>
      jsonResponse({ status: 200, body: EMPTY_AGENDA }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCalendarView("agenda", "2025-10-23"));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.days).toEqual(EMPTY_AGENDA.days);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "/calendar/views/agenda?date=2025-10-20",
    );
  });

  it("reports failure when the view cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: 500, body: { code: "INTERNAL", message: "boom" } })),
    );

    const { result } = renderHook(() => useCalendarView("week", "2025-10-23"));

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.days).toEqual([]);
  });

  it("loads again when the date changes", async () => {
    const fetchMock = vi.fn<(url: string) => Promise<Response>>(async () =>
      jsonResponse({ status: 200, body: EMPTY_AGENDA }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result, rerender } = renderHook(
      ({ date }: { date: string }) => useCalendarView("day", date),
      { initialProps: { date: "2025-10-23" } },
    );
    await waitFor(() => expect(result.current.status).toBe("ready"));

    rerender({ date: "2025-10-24" });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("date=2025-10-24");
  });

  it("retries the same request after a failure", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ status: 500, body: { code: "INTERNAL", message: "boom" } }),
      )
      .mockResolvedValueOnce(jsonResponse({ status: 200, body: EMPTY_AGENDA }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCalendarView("agenda", "2025-10-23"));
    await waitFor(() => expect(result.current.status).toBe("failed"));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.days).toEqual(EMPTY_AGENDA.days);
  });
});
