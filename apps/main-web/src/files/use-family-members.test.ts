// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../test-support/json-response.js";
import { useFamilyMembers } from "./use-family-members.js";

const FAMILY_ID = "3a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const MEMBER = {
  userId: "7d8e9f0a-1b2c-4d3e-8f4a-5b6c7d8e9f0a",
  displayName: "Ben",
  role: "member",
  joinedAt: "2026-01-01T00:00:00.000Z",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFamilyMembers", () => {
  it("loads the members of the family", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: 200, body: { members: [MEMBER] } })),
    );

    const { result } = renderHook(() => useFamilyMembers(FAMILY_ID));

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.members).toEqual([MEMBER]);
  });

  it("reports failure without members when the list cannot be loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ status: 500, body: { error: "failed" } })),
    );

    const { result } = renderHook(() => useFamilyMembers(FAMILY_ID));

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.members).toEqual([]);
  });

  it("is ready without a request when there is no family", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useFamilyMembers(null));

    expect(result.current.status).toBe("ready");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
