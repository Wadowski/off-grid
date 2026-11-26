// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accountRoutes, calendarRoutes, filesRoutes } from "@offgrid/contracts";
import { vi } from "vitest";
import { isGetOf } from "./is-get-of.js";
import { jsonResponse } from "./json-response.js";
import type { FakeResponse } from "./types.js";

const EMPTY_NOTIFICATION_PAGE = { notifications: [], unreadCount: 0, nextCursor: null, total: 0 };
const UPLOAD_LIMIT_BYTES = 53_687_091_200;

export const stubApi = (responses: readonly FakeResponse[]) => {
  const queue = [...responses];
  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
    async (input, init) => {
      if (isGetOf(init, calendarRoutes.calendars, input)) {
        return jsonResponse({ status: 200, body: { calendars: [] } });
      }
      if (isGetOf(init, filesRoutes.uploadLimit, input)) {
        return jsonResponse({ status: 200, body: { maxUploadBytes: UPLOAD_LIMIT_BYTES } });
      }
      if (isGetOf(init, accountRoutes.notifications, input)) {
        return jsonResponse({ status: 200, body: EMPTY_NOTIFICATION_PAGE });
      }
      if (isGetOf(init, accountRoutes.notificationsStream, input)) {
        const pendingResponse = new Promise<Response>(() => undefined);
        return pendingResponse;
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
