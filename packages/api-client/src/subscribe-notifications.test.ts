// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, subscribeNotifications } from "./index.js";
import { STREAM_LINE_LIMIT_MESSAGE, INVALID_FRAME_MESSAGE } from "./constants.js";
import type { Notification, SubscribeNotificationsOptions } from "./types.js";

const BASE_URL = "http://localhost:3000/api";
const STREAM_URL = `${BASE_URL}/me/notifications/stream`;
const FIRST_ID = "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e5f";
const SECOND_ID = "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e60";
const RESET_FRAME = ": reset\n\n";
const HEARTBEAT_FRAME = ": heartbeat\n\n";
const RANDOM_MIN = () => 0;
const RANDOM_MAX = () => 1;

const notificationFrame = (id: string, data: Record<string, string> = {}) =>
  `event: notification\nid: ${id}\ndata: ${JSON.stringify({
    id,
    type: "event-reminder",
    category: "calendar",
    data,
    createdAt: "2026-11-01T10:00:00.000Z",
    readAt: null,
  })}\n\n`;

const streamResponse = (chunks: readonly (string | Uint8Array)[]) => {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(typeof chunk === "string" ? encoder.encode(chunk) : chunk);
        }
        controller.close();
      },
    }),
    { status: 200, headers: { "content-type": "text/event-stream" } },
  );
};

const openStreamResponse = (chunks: readonly string[]) => {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
      },
    }),
    { status: 200, headers: { "content-type": "text/event-stream" } },
  );
};

const errorResponse = (status: number, code: string, message: string) =>
  new Response(JSON.stringify({ code, message }), {
    status,
    headers: { "content-type": "application/json" },
  });

const headersOf = (init: RequestInit | undefined): Record<string, string> =>
  (init?.headers ?? {}) as Record<string, string>;

const subscribeWith = (
  transport: typeof fetch,
  overrides: Partial<SubscribeNotificationsOptions> = {},
) => {
  const controller = new AbortController();
  const calls = {
    notifications: [] as Notification[],
    resets: 0,
    errors: [] as Error[],
  };
  const done = subscribeNotifications({
    baseUrl: BASE_URL,
    fetch: transport,
    signal: controller.signal,
    random: RANDOM_MAX,
    onNotification: (notification) => {
      calls.notifications.push(notification);
    },
    onReset: () => {
      calls.resets += 1;
    },
    onError: (error) => {
      calls.errors.push(error);
    },
    ...overrides,
  });
  return { controller, calls, done };
};

const sequenceOf = (...responses: readonly (() => Response | Promise<Response>)[]) => {
  let index = 0;
  return vi.fn<typeof fetch>(async () => {
    const next = responses[index] ?? responses[responses.length - 1];
    index += 1;
    return next!();
  });
};

describe("subscribeNotifications", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("reading frames", () => {
    it("calls onNotification once for a frame split across chunks", async () => {
      const frame = notificationFrame(FIRST_ID);
      const transport = sequenceOf(
        () => streamResponse([frame.slice(0, 17), frame.slice(17, 90), frame.slice(90)]),
      );
      const { controller, calls, done } = subscribeWith(transport, {
        onNotification: (notification) => {
          calls.notifications.push(notification);
          controller.abort();
        },
      });
      await done;
      expect(calls.notifications.map((notification) => notification.id)).toEqual([FIRST_ID]);
      expect(calls.errors).toEqual([]);
    });

    it("keeps a multi-byte character intact when a chunk ends inside it", async () => {
      const frame = notificationFrame(FIRST_ID, { title: "🌲" });
      const bytes = new TextEncoder().encode(frame);
      const emojiStart = bytes.indexOf(new TextEncoder().encode("🌲")[0]!);
      const transport = sequenceOf(() =>
        streamResponse([bytes.slice(0, emojiStart + 2), bytes.slice(emojiStart + 2)]),
      );
      const { controller, calls, done } = subscribeWith(transport, {
        onNotification: (notification) => {
          calls.notifications.push(notification);
          controller.abort();
        },
      });
      await done;
      expect(calls.notifications[0]?.data).toEqual({ title: "🌲" });
    });

    it("ignores heartbeat comments", async () => {
      const transport = sequenceOf(() => openStreamResponse([HEARTBEAT_FRAME]));
      const { controller, calls, done } = subscribeWith(transport);
      await vi.advanceTimersByTimeAsync(0);
      controller.abort();
      await done;
      expect(calls).toEqual({ notifications: [], resets: 0, errors: [] });
    });

    it("calls onError for a frame that is not JSON and keeps the stream open", async () => {
      const transport = sequenceOf(() =>
        openStreamResponse([`event: notification\ndata: {"secret":\n\n`, notificationFrame(FIRST_ID)]),
      );
      const { controller, calls, done } = subscribeWith(transport, {
        onNotification: (notification) => {
          calls.notifications.push(notification);
          controller.abort();
        },
      });
      await done;
      expect(calls.errors.map((error) => error.message)).toEqual([INVALID_FRAME_MESSAGE]);
      expect(calls.notifications.map((notification) => notification.id)).toEqual([FIRST_ID]);
    });

    it("calls onError for a frame that fails schema validation and skips it", async () => {
      const invalid = `event: notification\ndata: {"id":"not-a-uuid"}\n\n`;
      const transport = sequenceOf(() => openStreamResponse([invalid]));
      const { controller, calls, done } = subscribeWith(transport);
      await vi.advanceTimersByTimeAsync(0);
      controller.abort();
      await done;
      expect(calls.errors.map((error) => error.message)).toEqual([INVALID_FRAME_MESSAGE]);
      expect(calls.notifications).toEqual([]);
    });

    it("stops buffering an endless line, calls onError and reconnects", async () => {
      const oversized = new TextEncoder().encode(`data: ${"a".repeat(1024 * 1024 + 1)}`);
      const transport = sequenceOf(
        () => streamResponse([oversized]),
        () => openStreamResponse([]),
      );
      const { controller, calls, done } = subscribeWith(transport);
      await vi.advanceTimersByTimeAsync(1000);
      controller.abort();
      await done;
      expect(calls.errors.map((error) => error.message)).toEqual([STREAM_LINE_LIMIT_MESSAGE]);
      expect(transport).toHaveBeenCalledTimes(2);
    });
  });

  describe("reconnecting", () => {
    it("requests the stream URL with an event-stream accept header and no Last-Event-ID first", async () => {
      const transport = sequenceOf(() => openStreamResponse([]));
      const { controller, done } = subscribeWith(transport);
      await vi.advanceTimersByTimeAsync(0);
      controller.abort();
      await done;
      const [url, init] = transport.mock.calls[0]!;
      expect(url).toBe(STREAM_URL);
      expect(headersOf(init)).toEqual({ accept: "text/event-stream" });
    });

    it("sends the last notification id as Last-Event-ID on reconnect", async () => {
      const transport = sequenceOf(
        () => streamResponse([notificationFrame(FIRST_ID)]),
        () => streamResponse([notificationFrame(SECOND_ID)]),
        () => openStreamResponse([]),
      );
      const { controller, done } = subscribeWith(transport);
      await vi.advanceTimersByTimeAsync(5000);
      controller.abort();
      await done;
      expect(headersOf(transport.mock.calls[0]![1])["last-event-id"]).toBeUndefined();
      expect(headersOf(transport.mock.calls[1]![1])["last-event-id"]).toBe(FIRST_ID);
      expect(headersOf(transport.mock.calls[2]![1])["last-event-id"]).toBe(SECOND_ID);
    });

    it("clears the remembered id on reset and calls onReset", async () => {
      const transport = sequenceOf(
        () => streamResponse([notificationFrame(FIRST_ID)]),
        () => streamResponse([RESET_FRAME]),
        () => openStreamResponse([]),
      );
      const { controller, calls, done } = subscribeWith(transport);
      await vi.advanceTimersByTimeAsync(5000);
      controller.abort();
      await done;
      expect(calls.resets).toBe(1);
      expect(headersOf(transport.mock.calls[2]![1])["last-event-id"]).toBeUndefined();
    });

    it("retries after a server error and reports it through onError", async () => {
      const transport = sequenceOf(
        () => errorResponse(503, "UNEXPECTED_RESPONSE", "Unavailable."),
        () => openStreamResponse([]),
      );
      const { controller, calls, done } = subscribeWith(transport);
      await vi.advanceTimersByTimeAsync(1000);
      controller.abort();
      await done;
      expect(calls.errors).toHaveLength(1);
      expect(calls.errors[0]).toBeInstanceOf(ApiError);
      expect((calls.errors[0] as ApiError).status).toBe(503);
      expect(transport).toHaveBeenCalledTimes(2);
    });

    it("retries after a network error and reports it through onError", async () => {
      const transport = sequenceOf(
        () => Promise.reject(new TypeError("fetch failed")),
        () => openStreamResponse([]),
      );
      const { controller, calls, done } = subscribeWith(transport);
      await vi.advanceTimersByTimeAsync(1000);
      controller.abort();
      await done;
      expect(calls.errors.map((error) => error.message)).toEqual(["fetch failed"]);
      expect(transport).toHaveBeenCalledTimes(2);
    });

    it("grows the delay between failures and resets it after a healthy connection", async () => {
      const callTimes: number[] = [];
      const transport = vi.fn<typeof fetch>(async () => {
        callTimes.push(Date.now());
        if (callTimes.length <= 3) {
          return errorResponse(503, "UNEXPECTED_RESPONSE", "Unavailable.");
        }
        if (callTimes.length === 4) {
          return streamResponse([HEARTBEAT_FRAME]);
        }
        controller.abort();
        return openStreamResponse([]);
      });
      const { controller, done } = subscribeWith(transport, { random: RANDOM_MAX });
      await vi.advanceTimersByTimeAsync(60000);
      await done;
      const gaps = callTimes.slice(1).map((time, index) => time - callTimes[index]!);
      expect(gaps).toEqual([1000, 2000, 4000, 1000]);
    });

    it("applies jitter between half and all of the exponential delay", async () => {
      const callTimes: number[] = [];
      const transport = vi.fn<typeof fetch>(async () => {
        callTimes.push(Date.now());
        if (callTimes.length === 1) {
          return errorResponse(503, "UNEXPECTED_RESPONSE", "Unavailable.");
        }
        controller.abort();
        return openStreamResponse([]);
      });
      const { controller, done } = subscribeWith(transport, { random: RANDOM_MIN });
      await vi.advanceTimersByTimeAsync(60000);
      await done;
      expect(callTimes[1]! - callTimes[0]!).toBe(500);
    });

    it("stops at 401 after one onError and does not retry", async () => {
      const transport = sequenceOf(() => errorResponse(401, "UNAUTHENTICATED", "Sign in again."));
      const { calls, done } = subscribeWith(transport);
      await done;
      await vi.advanceTimersByTimeAsync(60000);
      expect(transport).toHaveBeenCalledTimes(1);
      expect(calls.errors).toHaveLength(1);
      expect(calls.errors[0]).toBeInstanceOf(ApiError);
      expect((calls.errors[0] as ApiError).status).toBe(401);
    });
  });

  describe("aborting", () => {
    it("does not connect when the signal is already aborted", async () => {
      const transport = sequenceOf(() => openStreamResponse([]));
      const controller = new AbortController();
      controller.abort();
      await subscribeNotifications({
        baseUrl: BASE_URL,
        fetch: transport,
        signal: controller.signal,
        onNotification: vi.fn(),
        onReset: vi.fn(),
        onError: vi.fn(),
      });
      expect(transport).not.toHaveBeenCalled();
    });

    it("stops during the body read without calling onError", async () => {
      const transport = sequenceOf(() => openStreamResponse([HEARTBEAT_FRAME]));
      const { controller, calls, done } = subscribeWith(transport);
      await vi.advanceTimersByTimeAsync(0);
      controller.abort();
      await done;
      expect(transport).toHaveBeenCalledTimes(1);
      expect(calls.errors).toEqual([]);
    });

    it("stops during the backoff wait without calling onError", async () => {
      const transport = sequenceOf(() => streamResponse([]));
      const { controller, calls, done } = subscribeWith(transport);
      await vi.advanceTimersByTimeAsync(0);
      controller.abort();
      await done;
      await vi.advanceTimersByTimeAsync(60000);
      expect(transport).toHaveBeenCalledTimes(1);
      expect(calls.errors).toEqual([]);
    });
  });
});
