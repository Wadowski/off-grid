// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../test-support/json-response.js";
import { useDrives } from "./use-drives.js";

const PERSONAL = {
  id: "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d",
  familyId: null,
  name: "Personal",
  createdAt: "2026-01-01T00:00:00.000Z",
};
const FAMILY = {
  id: "5c6d7e8f-9a0b-4c1d-8e2f-3a4b5c6d7e8f",
  familyId: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f",
  name: "Household",
  createdAt: "2026-01-02T00:00:00.000Z",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useDrives", () => {
  it("loads the drives the person can open", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: 200, body: { drives: [PERSONAL] } })),
    );

    const { result } = renderHook(() => useDrives(true));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.drives).toEqual([PERSONAL]);
    expect(result.current.errorTextId).toBeNull();
  });

  it("reports failed with a files error text when the list cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: 500, body: { code: "INTERNAL", message: "boom" } })),
    );

    const { result } = renderHook(() => useDrives(true));

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.errorTextId).toBe("files.errors.failed");
    expect(result.current.drives).toEqual([]);
  });

  it("does not load while disabled", () => {
    const fetchMock = vi.fn(async () => jsonResponse({ status: 200, body: { drives: [] } }));
    vi.stubGlobal("fetch", fetchMock);

    renderHook(() => useDrives(false));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reloads the list when refreshed after a change", async () => {
    const responses = [
      jsonResponse({ status: 200, body: { drives: [PERSONAL] } }),
      jsonResponse({ status: 200, body: { drives: [PERSONAL, FAMILY] } }),
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => responses.shift() ?? jsonResponse({ status: 200, body: { drives: [] } })),
    );

    const { result } = renderHook(() => useDrives(true));
    await waitFor(() => expect(result.current.drives).toEqual([PERSONAL]));

    await act(() => result.current.refresh());

    expect(result.current.drives).toEqual([PERSONAL, FAMILY]);
    expect(result.current.status).toBe("ready");
  });
});
