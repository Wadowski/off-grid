// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes, calendarRoutes } from "@offgrid/contracts";
import { vi } from "vitest";
import { jsonResponse } from "./json-response.js";
import type { FakeResponse } from "./types.js";

const EMPTY_NOTIFICATION_PAGE = { notifications: [], unreadCount: 0, nextCursor: null, total: 0 };

const isGetOf = (init: RequestInit | undefined, path: string, input: RequestInfo | URL): boolean =>
  (init?.method ?? "GET") === "GET" &&
  new URL(String(input), "http://localhost").pathname.endsWith(path);

export const stubApi = (responses: readonly FakeResponse[]) => {
  const queue = [...responses];
  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
    async (input, init) => {
      if (isGetOf(init, calendarRoutes.calendars, input)) {
        return jsonResponse({ status: 200, body: { calendars: [] } });
      }
      if (isGetOf(init, accountRoutes.notifications, input)) {
        return jsonResponse({ status: 200, body: EMPTY_NOTIFICATION_PAGE });
      }
      if (isGetOf(init, accountRoutes.notificationsStream, input)) {
        return new Promise<Response>(() => undefined);
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
