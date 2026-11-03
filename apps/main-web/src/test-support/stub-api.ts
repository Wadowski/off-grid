// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { vi } from "vitest";
import { jsonResponse } from "./json-response.js";
import type { FakeResponse } from "./types.js";

export const stubApi = (responses: readonly FakeResponse[]) => {
  const queue = [...responses];
  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
    async () => {
      const next = queue.shift();
      if (next === undefined) {
        throw new Error("Unexpected request");
      }
      return jsonResponse(next);
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};
