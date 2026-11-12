// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../test-support/json-response.js";
import { useCalendars } from "./use-calendars.js";

const STUDIO = {
  id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Studio",
  color: "teal",
  familyId: null,
  isDefault: false,
};
const KITCHEN = {
  id: "2b7d4e6f-1a2b-4c3d-8e9f-0a1b2c3d4e5f",
  name: "Kitchen",
  color: "amber",
  familyId: "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f",
  isDefault: false,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCalendars", () => {
  it("loads the calendars the person can access", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: 200, body: { calendars: [STUDIO] } })),
    );

    const { result } = renderHook(() => useCalendars(true));

    await waitFor(() => expect(result.current.listStatus).toBe("ready"));
    expect(result.current.calendars).toEqual([STUDIO]);
  });

  it("reports failure when the list cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: 500, body: { code: "INTERNAL", message: "boom" } })),
    );

    const { result } = renderHook(() => useCalendars(true));

    await waitFor(() => expect(result.current.listStatus).toBe("failed"));
    expect(result.current.calendars).toEqual([]);
  });

  it("does not load while disabled", () => {
    const fetchMock = vi.fn(async () => jsonResponse({ status: 200, body: { calendars: [] } }));
    vi.stubGlobal("fetch", fetchMock);

    renderHook(() => useCalendars(false));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reloads the list when refreshed after a change", async () => {
    const responses = [
      jsonResponse({ status: 200, body: { calendars: [STUDIO] } }),
      jsonResponse({ status: 200, body: { calendars: [STUDIO, KITCHEN] } }),
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => responses.shift() ?? jsonResponse({ status: 200, body: { calendars: [] } }),
      ),
    );

    const { result } = renderHook(() => useCalendars(true));
    await waitFor(() => expect(result.current.calendars).toEqual([STUDIO]));

    await act(() => result.current.refreshCalendars());

    expect(result.current.calendars).toEqual([STUDIO, KITCHEN]);
    expect(result.current.listStatus).toBe("ready");
  });
});
