// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { vi } from "vitest";
import { jsonResponse } from "./json-response.js";
import type { FakeResponse } from "./types.js";

export const stubApi = (responses: readonly FakeResponse[]) => {
  const queue = [...responses];
  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
    async (input, init) => {
      // The shell loads the calendar list on every mount. Answer it with an empty list
      // so tests that do not script calendars keep their own response order.
      if ((init?.method ?? "GET") === "GET" && String(input).endsWith("/calendars")) {
        return jsonResponse({ status: 200, body: { calendars: [] } });
      }
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
