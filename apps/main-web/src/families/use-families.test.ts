// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../test-support/json-response.js";
import { useFamilies } from "./use-families.js";

const LAKESIDE = { id: "9f1c2a4e-8d3b-4c6a-9e2f-1a2b3c4d5e6f", name: "Lakeside" };
const CREATED_AT = "2026-10-31T10:00:00.000Z";

const deferredResponse = () => {
  let resolve!: (response: Response) => void;
  const response = new Promise<Response>((done) => {
    resolve = done;
  });
  return { response, resolve };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFamilies", () => {
  it("ignores an older family list that arrives after a newer one", async () => {
    const staleList = deferredResponse();
    const listResponses = [
      staleList.response,
      Promise.resolve(jsonResponse({ status: 200, body: { families: [LAKESIDE] } })),
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === "POST") {
          return jsonResponse({ status: 201, body: { ...LAKESIDE, createdAt: CREATED_AT } });
        }
        const next = listResponses.shift();
        if (next === undefined) {
          throw new Error("Unexpected request");
        }
        return next;
      }),
    );

    const { result } = renderHook(() => useFamilies());
    await act(() => result.current.submitFamily("Lakeside"));
    await waitFor(() => expect(result.current.families).toEqual([LAKESIDE]));

    await act(async () => {
      staleList.resolve(jsonResponse({ status: 200, body: { families: [] } }));
    });

    expect(result.current.families).toEqual([LAKESIDE]);
    expect(result.current.listStatus).toBe("ready");
  });
});
