// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient, createNotificationsClient } from "./index.js";

const BASE_URL = "http://localhost:3000/api";
const NOTIFICATION_ID = "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e5f";

const notice = {
  id: NOTIFICATION_ID,
  type: "password-changed",
  category: "account-security",
  data: {},
  createdAt: "2026-11-01T10:00:00.000Z",
  readAt: null,
};

const list = {
  notifications: [notice],
  unreadCount: 1,
  nextCursor: null,
  total: 1,
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const notificationsWith = (response: Response) => {
  const transport = vi.fn<typeof fetch>().mockResolvedValue(response);
  const client = createApiClient({ baseUrl: BASE_URL, fetch: transport });
  return { notifications: createNotificationsClient(client), transport };
};

describe("createNotificationsClient", () => {
  it("lists notifications without a query string when no option is set", async () => {
    const { notifications, transport } = notificationsWith(jsonResponse(list));

    await expect(notifications.list()).resolves.toEqual(list);
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/me/notifications`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("sends the list options as a query string", async () => {
    const { notifications, transport } = notificationsWith(jsonResponse(list));

    await notifications.list({ cursor: "abc", limit: 20, category: "calendar", unread: "true" });
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/me/notifications?cursor=abc&limit=20&category=calendar&unread=true`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("rejects a list response that does not match the contract", async () => {
    const { notifications } = notificationsWith(
      jsonResponse({ notifications: [notice], total: 1 }),
    );

    await expect(notifications.list()).rejects.toThrow();
  });

  it("marks one notification read with its id encoded in the path", async () => {
    const { notifications, transport } = notificationsWith(new Response(null, { status: 204 }));

    await expect(notifications.markRead("a/b c")).resolves.toBeUndefined();
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/me/notifications/a%2Fb%20c/read`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("marks all notifications read and returns the count", async () => {
    const { notifications, transport } = notificationsWith(jsonResponse({ updated: 3 }));

    await expect(notifications.markAllRead()).resolves.toEqual({ updated: 3 });
    expect(transport).toHaveBeenCalledWith(
      `${BASE_URL}/me/notifications/read-all`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("rejects a mark-all-read response that does not match the contract", async () => {
    const { notifications } = notificationsWith(jsonResponse({ updated: -1 }));

    await expect(notifications.markAllRead()).rejects.toThrow();
  });
});

describe("createNotificationsClient errors", () => {
  it("maps a 404 on markRead to an ApiError with its code", async () => {
    const { notifications } = notificationsWith(
      jsonResponse({ code: "NOT_FOUND", message: "Notification not found." }, 404),
    );

    const error = await notifications.markRead(NOTIFICATION_ID).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, code: "NOT_FOUND" });
  });

  it("maps a 400 on list to an ApiError with its code", async () => {
    const { notifications } = notificationsWith(
      jsonResponse({ code: "VALIDATION_FAILED", message: "Invalid query." }, 400),
    );

    const error = await notifications.list({ limit: 0 }).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, code: "VALIDATION_FAILED" });
  });

  it("maps a 401 on markAllRead to an ApiError with its code", async () => {
    const { notifications } = notificationsWith(
      jsonResponse({ code: "UNAUTHENTICATED", message: "Sign in again." }, 401),
    );

    const error = await notifications.markAllRead().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, code: "UNAUTHENTICATED" });
  });

  it("maps a non-ErrorResponse error body to UNEXPECTED_RESPONSE", async () => {
    const { notifications } = notificationsWith(new Response("oops", { status: 500 }));

    const error = await notifications.list().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500, code: "UNEXPECTED_RESPONSE" });
  });
});
