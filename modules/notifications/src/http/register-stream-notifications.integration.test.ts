// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ModuleDatabase } from "@offgrid/db";
import type { Logger } from "@offgrid/observability";
import Fastify, { type FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { startNotificationsTestDatabase } from "../../test/start-notifications-test-database.js";
import type { NotificationsTestDatabase } from "../../test/types.js";
import { writeInboxNotification } from "../application/inbox/write-inbox-notification.js";
import {
  MAX_NOTIFICATION_STREAMS_PER_USER,
  MAX_REPLAY_NOTICES,
  SUBSCRIBER_QUEUE_LIMIT,
} from "../constants.js";
import { createNotificationHub } from "../infrastructure/realtime/create-notification-hub.js";
import type {
  ListedNotification,
  NotificationHub,
  NotificationRouteContext,
  SessionVerifier,
} from "../types.js";
import { registerStreamNotifications } from "./register-stream-notifications.js";

const ANNA = "5a6b7c8d-9e0f-4a1b-8c2d-3e4f5a6b7c8d";
const BEN = "0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e";
const TRACE_ID = "3f2a1b0c-9d8e-4f7a-8b6c-5d4e3f2a1b0c";
const FAR_FUTURE = new Date("2099-01-01T00:00:00.000Z");

const notice = (id: string): ListedNotification => ({
  id,
  type: "event-invited",
  category: "calendar",
  data: { eventId: "1f2e3d4c-5b6a-4978-8a9b-0c1d2e3f4a5b" },
  createdAt: "2026-05-01T10:00:00.000Z",
  readAt: null,
});

const frameFor = (item: ListedNotification): string =>
  `event: notification\nid: ${item.id}\ndata: ${JSON.stringify(item)}\n\n`;

let lastLogger: { error: ReturnType<typeof vi.fn> } | null = null;

const loggerSpy = (): Logger => {
  const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), child: vi.fn() };
  lastLogger = logger;
  return logger as unknown as Logger;
};

const BASE_TIME = Date.parse("2026-11-01T00:00:00Z");

const secondsAfterBase = (seconds: number): string =>
  new Date(BASE_TIME + seconds * 1000).toISOString();

const waitFor = async (condition: () => boolean): Promise<void> => {
  const deadline = Date.now() + 2000;
  while (!condition()) {
    if (Date.now() > deadline) {
      throw new Error("condition not met in time");
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 2);
    });
  }
};

const collectBody = (response: Response) => {
  const received = { text: "", ended: false };
  const reader = response.body?.getReader();
  if (reader === undefined) {
    throw new Error("response has no body");
  }
  const decoder = new TextDecoder();
  void (async () => {
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        received.text += decoder.decode(value, { stream: true });
      }
    } catch {
      received.ended = true;
    }
    received.ended = true;
  })();
  return received;
};

const countOccurrences = (text: string, part: string): number => text.split(part).length - 1;

describe("notification stream route", { timeout: 60_000 }, () => {
  const controllers: AbortController[] = [];
  let database: NotificationsTestDatabase;
  let app: FastifyInstance;
  let appClosed: boolean;
  let baseUrl: string;
  let hub: NotificationHub;
  let unsubscribeCalls: ReturnType<typeof vi.fn>;
  let session: { revoked: boolean; throws: boolean; accessExpiresAt: Date };
  let verifySession: SessionVerifier;

  const trackingHub = (base: NotificationHub): NotificationHub => ({
    publish: base.publish,
    close: base.close,
    subscribe: (userId, subscriber) => {
      const unsubscribe = base.subscribe(userId, subscriber);
      return () => {
        unsubscribeCalls();
        unsubscribe();
      };
    },
  });

  const startApp = async (heartbeatMs: number, db: ModuleDatabase = database.db): Promise<void> => {
    app = Fastify();
    appClosed = false;
    app.addHook("onRequest", async (_request, reply) => {
      reply.header("x-trace-id", TRACE_ID);
    });
    const context: NotificationRouteContext = {
      db,
      currentUserId: (request) => {
        const header = request.headers["x-user-id"];
        return typeof header === "string" ? header : null;
      },
      logger: loggerSpy(),
      hub,
      verifySession,
      streamHeartbeatMs: heartbeatMs,
    };
    await app.register(async (api) => registerStreamNotifications(api, context));
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (address === null || typeof address === "string") {
      throw new Error("server has no port");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  };

  const closeApp = async (): Promise<void> => {
    if (!appClosed) {
      appClosed = true;
      await app.close();
    }
  };

  const openStream = async (userId: string, headers: Record<string, string> = {}) => {
    const controller = new AbortController();
    controllers.push(controller);
    const response = await fetch(`${baseUrl}/me/notifications/stream`, {
      headers: { "x-user-id": userId, ...headers },
      signal: controller.signal,
    });
    return { response, stream: collectBody(response), abort: () => controller.abort() };
  };

  beforeAll(async () => {
    database = await startNotificationsTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await database.stop();
  }, 120_000);

  beforeEach(async () => {
    await database.reset();
    unsubscribeCalls = vi.fn();
    session = { revoked: false, throws: false, accessExpiresAt: FAR_FUTURE };
    verifySession = vi.fn(async (request) => {
      if (session.throws) {
        throw new TypeError("database unavailable");
      }
      const header = request.headers["x-user-id"];
      if (session.revoked || typeof header !== "string") {
        return null;
      }
      return { userId: header, sessionId: "session-1", accessExpiresAt: session.accessExpiresAt };
    });
    hub = trackingHub(
      createNotificationHub(loggerSpy(), SUBSCRIBER_QUEUE_LIMIT, MAX_NOTIFICATION_STREAMS_PER_USER),
    );
  });

  afterEach(async () => {
    for (const controller of controllers.splice(0)) {
      controller.abort();
    }
    hub.close();
    await closeApp();
  });

  describe("access", () => {
    it("refuses a request without a signed-in person with a JSON error, not a stream", async () => {
      await startApp(1000);

      const response = await fetch(`${baseUrl}/me/notifications/stream`);

      expect(response.status).toBe(401);
      expect(response.headers.get("content-type")).not.toBe("text/event-stream");
      await expect(response.json()).resolves.toEqual({
        code: "UNAUTHENTICATED",
        message: expect.any(String),
      });
    });

    it("refuses a request whose session no longer verifies", async () => {
      await startApp(1000);
      session.revoked = true;

      const { response } = await openStream(ANNA);

      expect(response.status).toBe(401);
    });
  });

  const seedNotice = async (
    userId: string,
    createdAt: string,
    notificationId = randomUUID(),
  ): Promise<string> => {
    await writeInboxNotification(database.db, {
      notificationId,
      userId,
      type: "password-changed",
      data: {},
      createdAt: new Date(createdAt),
    });
    return notificationId;
  };

  describe("replay on reconnect", () => {
    it("replays the notices newer than Last-Event-ID oldest first, before live frames", async () => {
      await startApp(1000);
      const cursor = await seedNotice(ANNA, secondsAfterBase(0));
      const second = await seedNotice(ANNA, secondsAfterBase(1));
      const third = await seedNotice(ANNA, secondsAfterBase(2));
      const { stream } = await openStream(ANNA, { "last-event-id": cursor });
      await waitFor(() => stream.text.includes(`id: ${third}\n`));

      const live = notice("9d3c1f2e-7a6b-4c5d-8e9f-0a1b2c3d4e5f");
      hub.publish(ANNA, live);
      await waitFor(() => stream.text.includes(`id: ${live.id}\n`));

      expect(stream.text.indexOf(`id: ${second}\n`)).toBeLessThan(
        stream.text.indexOf(`id: ${third}\n`),
      );
      expect(stream.text.indexOf(`id: ${third}\n`)).toBeLessThan(
        stream.text.indexOf(`id: ${live.id}\n`),
      );
      expect(stream.text).not.toContain(": reset");
      expect(countOccurrences(stream.text, `id: ${cursor}\n`)).toBe(0);
    });

    it("sends a notice that is both replayed and published live exactly once", async () => {
      await startApp(1000);
      const cursor = await seedNotice(ANNA, secondsAfterBase(0));
      const missed = await seedNotice(ANNA, secondsAfterBase(1));
      const { stream } = await openStream(ANNA, { "last-event-id": cursor });

      hub.publish(ANNA, notice(missed));
      const marker = await seedNotice(ANNA, secondsAfterBase(2));
      hub.publish(ANNA, notice(marker));
      await waitFor(() => stream.text.includes(`id: ${marker}\n`));

      expect(countOccurrences(stream.text, `id: ${missed}\n`)).toBe(1);
    });

    it("sends a reset comment for an unknown Last-Event-ID and keeps the stream live", async () => {
      await startApp(1000);
      const { stream } = await openStream(ANNA, { "last-event-id": randomUUID() });

      const live = notice("9d3c1f2e-7a6b-4c5d-8e9f-0a1b2c3d4e5f");
      hub.publish(ANNA, live);

      await waitFor(() => stream.text.includes(`id: ${live.id}\n`));
      expect(stream.text).toContain(": reset\n\n");
      expect(stream.ended).toBe(false);
    });

    it("sends a reset comment for another person's notice id, with no leak of their notices", async () => {
      await startApp(1000);
      const bensCursor = await seedNotice(BEN, secondsAfterBase(0));
      const bensLater = await seedNotice(BEN, secondsAfterBase(1));
      const { stream } = await openStream(ANNA, { "last-event-id": bensCursor });

      const live = notice("9d3c1f2e-7a6b-4c5d-8e9f-0a1b2c3d4e5f");
      hub.publish(ANNA, live);

      await waitFor(() => stream.text.includes(`id: ${live.id}\n`));
      expect(stream.text).toContain(": reset\n\n");
      expect(stream.text).not.toContain(bensLater);
    });

    it("sends a reset comment for an id that is not a UUID", async () => {
      await startApp(1000);
      const { stream } = await openStream(ANNA, { "last-event-id": "not-a-uuid" });

      await waitFor(() => stream.text.includes(": reset"));
      expect(stream.text).toContain(": reset\n\n");
      expect(countOccurrences(stream.text, "event: notification")).toBe(0);
    });

    it("sends a reset comment when more than the cap of notices are newer", async () => {
      await startApp(1000);
      const cursor = await seedNotice(ANNA, secondsAfterBase(0));
      for (let index = 1; index <= MAX_REPLAY_NOTICES + 1; index += 1) {
        await seedNotice(ANNA, secondsAfterBase(index));
      }
      const { stream } = await openStream(ANNA, { "last-event-id": cursor });

      await waitFor(() => stream.text.includes(": reset"));
      expect(countOccurrences(stream.text, "event: notification")).toBe(0);
    });

    it("sends a reset comment and keeps the stream live when the replay read fails", async () => {
      const failingDb = {
        $transaction: async () => {
          throw new TypeError("database unavailable");
        },
      } as unknown as ModuleDatabase;
      await startApp(1000, failingDb);
      const { stream } = await openStream(ANNA, { "last-event-id": randomUUID() });

      const live = notice("9d3c1f2e-7a6b-4c5d-8e9f-0a1b2c3d4e5f");
      hub.publish(ANNA, live);

      await waitFor(() => stream.text.includes(`id: ${live.id}\n`));
      expect(stream.text).toContain(": reset\n\n");
      expect(stream.ended).toBe(false);
      expect(lastLogger?.error).toHaveBeenCalledWith(expect.any(String), {
        error: "TypeError",
      });
    });

    it("never logs the Last-Event-ID value or notice text", async () => {
      const failingDb = {
        $transaction: async () => {
          throw new TypeError("database unavailable");
        },
      } as unknown as ModuleDatabase;
      await startApp(1000, failingDb);
      const lastEventId = randomUUID();
      const { stream } = await openStream(ANNA, { "last-event-id": lastEventId });
      await waitFor(() => stream.text.includes(": reset"));

      expect(JSON.stringify(lastLogger?.error.mock.calls)).not.toContain(lastEventId);
    });

    it("does not replay or reset when no Last-Event-ID is sent", async () => {
      await startApp(1000);
      const cursor = await seedNotice(ANNA, secondsAfterBase(0));
      const newer = await seedNotice(ANNA, secondsAfterBase(1));
      const { stream } = await openStream(ANNA);
      await waitFor(() => stream.text.includes(": connected"));

      const live = notice("9d3c1f2e-7a6b-4c5d-8e9f-0a1b2c3d4e5f");
      hub.publish(ANNA, live);
      await waitFor(() => stream.text.includes(`id: ${live.id}\n`));

      expect(stream.text).not.toContain(`id: ${cursor}\n`);
      expect(stream.text).not.toContain(`id: ${newer}\n`);
      expect(stream.text).not.toContain(": reset");
    });
  });

  describe("streaming", () => {
    it("answers with event-stream headers and keeps the trace id from the request hooks", async () => {
      await startApp(1000);

      const { response } = await openStream(ANNA);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("text/event-stream");
      expect(response.headers.get("cache-control")).toBe("no-cache");
      expect(response.headers.get("x-accel-buffering")).toBe("no");
      expect(response.headers.get("x-trace-id")).toBe(TRACE_ID);
    });

    it("delivers a notice published to the person as one notification frame", async () => {
      await startApp(1000);
      const { stream } = await openStream(ANNA);
      const published = notice("9d3c1f2e-7a6b-4c5d-8e9f-0a1b2c3d4e5f");

      hub.publish(ANNA, published);

      await waitFor(() => stream.text.includes(frameFor(published)));
      expect(stream.text).toContain(frameFor(published));
    });

    it("never delivers one person's notice to another person's open stream", async () => {
      await startApp(1000);
      const anna = await openStream(ANNA);
      const ben = await openStream(BEN);
      const forAnna = notice("9d3c1f2e-7a6b-4c5d-8e9f-0a1b2c3d4e5f");
      const forBen = notice("1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d");

      hub.publish(ANNA, forAnna);
      await waitFor(() => anna.stream.text.includes(forAnna.id));
      expect(ben.stream.text).not.toContain(forAnna.id);

      hub.publish(BEN, forBen);
      await waitFor(() => ben.stream.text.includes(forBen.id));
      expect(ben.stream.text).not.toContain(forAnna.id);
      expect(countOccurrences(ben.stream.text, "event: notification")).toBe(1);
    });

    it("unsubscribes and stops writing when the client disconnects", async () => {
      await startApp(1000);
      const { stream, abort } = await openStream(ANNA);

      abort();
      await waitFor(() => unsubscribeCalls.mock.calls.length === 1);
      hub.publish(ANNA, notice("9d3c1f2e-7a6b-4c5d-8e9f-0a1b2c3d4e5f"));

      expect(unsubscribeCalls).toHaveBeenCalledTimes(1);
      expect(stream.text).not.toContain("event: notification");
    });

    it("ends the response when the hub closes the stream", async () => {
      await startApp(1000);
      const { stream } = await openStream(ANNA);

      hub.close();

      await waitFor(() => stream.ended);
      expect(stream.ended).toBe(true);
    });

    it("sends a heartbeat comment on each interval", async () => {
      await startApp(10);
      const { stream } = await openStream(ANNA);

      await waitFor(() => countOccurrences(stream.text, ": heartbeat") >= 2);
      expect(countOccurrences(stream.text, ": heartbeat")).toBeGreaterThanOrEqual(2);
    });

    it("ends the stream on the next heartbeat once the session is revoked", async () => {
      await startApp(10);
      const { stream } = await openStream(ANNA);

      session.revoked = true;

      await waitFor(() => stream.ended);
      expect(stream.ended).toBe(true);
    });

    it("ends the stream when the access token expires", async () => {
      await startApp(1000);
      session.accessExpiresAt = new Date(Date.now() + 150);
      const { stream } = await openStream(ANNA);

      await waitFor(() => stream.ended);
      expect(stream.ended).toBe(true);
    });

    it("keeps the stream open when the session check fails", async () => {
      await startApp(10);
      const { stream } = await openStream(ANNA);

      session.throws = true;
      await waitFor(() => countOccurrences(stream.text, ": heartbeat") >= 2);
      const published = notice("9d3c1f2e-7a6b-4c5d-8e9f-0a1b2c3d4e5f");
      hub.publish(ANNA, published);

      await waitFor(() => stream.text.includes(published.id));
      expect(stream.ended).toBe(false);
    });

    it("closes the oldest stream of a person who opens more than the cap", async () => {
      await startApp(1000);
      const oldest = await openStream(ANNA);
      const ben = await openStream(BEN);
      for (let index = 1; index < MAX_NOTIFICATION_STREAMS_PER_USER; index += 1) {
        await openStream(ANNA);
      }

      await openStream(ANNA);

      await waitFor(() => oldest.stream.ended);
      expect(ben.stream.ended).toBe(false);
    });

    it("lets app.close finish while a stream is open", async () => {
      await startApp(1000);
      await openStream(ANNA);

      await closeApp();

      expect(appClosed).toBe(true);
    });
  });
});
