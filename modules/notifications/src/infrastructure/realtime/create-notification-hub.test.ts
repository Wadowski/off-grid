// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Logger } from "@offgrid/observability";
import { describe, expect, it, vi } from "vitest";
import type { ListedNotification, NoticeSubscriber } from "../../types.js";
import { createNotificationHub } from "./create-notification-hub.js";
import { MAX_NOTIFICATION_STREAMS_PER_USER } from "../../constants.js";

const USER_A = "5a6b7c8d-9e0f-4a1b-8c2d-3e4f5a6b7c8d";
const USER_B = "0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e";

const notice = (id: string, data: Record<string, string> = {}): ListedNotification => ({
  id,
  type: "password-changed",
  category: "account-security",
  data,
  createdAt: "2026-05-01T10:00:00.000Z",
  readAt: null,
});

const recordingSubscriber = () => {
  const received: string[] = [];
  const close = vi.fn();
  const subscriber: NoticeSubscriber = {
    send: async (item) => {
      received.push(item.id);
    },
    close,
  };
  return { subscriber, received, close };
};

const loggerSpy = () => {
  const warn = vi.fn();
  const logger = { debug: vi.fn(), info: vi.fn(), warn, error: vi.fn(), child: vi.fn() };
  return { logger: logger as unknown as Logger, warn };
};

const waitUntil = async (condition: () => boolean): Promise<void> => {
  const deadline = Date.now() + 1000;
  while (!condition()) {
    if (Date.now() > deadline) {
      throw new Error("condition not met in time");
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1);
    });
  }
};

const blockedSubscriber = () => {
  const send = vi.fn(() => new Promise<void>(() => undefined));
  const close = vi.fn();
  const subscriber: NoticeSubscriber = { send, close };
  return { subscriber, send, close };
};

describe("createNotificationHub", () => {
  describe("delivery to a person's subscribers", () => {
    it("delivers each notice to every subscriber of that user, in publish order", async () => {
      const { logger } = loggerSpy();
      const hub = createNotificationHub(logger, 10, MAX_NOTIFICATION_STREAMS_PER_USER);
      const first = recordingSubscriber();
      const second = recordingSubscriber();
      hub.subscribe(USER_A, first.subscriber);
      hub.subscribe(USER_A, second.subscriber);

      hub.publish(USER_A, notice("n1"));
      hub.publish(USER_A, notice("n2"));

      await waitUntil(() => first.received.length === 2 && second.received.length === 2);
      expect(first.received).toEqual(["n1", "n2"]);
      expect(second.received).toEqual(["n1", "n2"]);
    });

    it("never delivers a notice for one user to a subscriber of another user", async () => {
      const { logger } = loggerSpy();
      const hub = createNotificationHub(logger, 10, MAX_NOTIFICATION_STREAMS_PER_USER);
      const userA = recordingSubscriber();
      const userB = recordingSubscriber();
      hub.subscribe(USER_A, userA.subscriber);
      hub.subscribe(USER_B, userB.subscriber);

      hub.publish(USER_A, notice("for-a"));
      hub.publish(USER_B, notice("for-b"));

      await waitUntil(() => userA.received.length === 1 && userB.received.length === 1);
      expect(userA.received).toEqual(["for-a"]);
      expect(userB.received).toEqual(["for-b"]);
    });
  });

  describe("unsubscribe", () => {
    it("stops delivery to that subscriber and is safe to call twice", async () => {
      const { logger } = loggerSpy();
      const hub = createNotificationHub(logger, 10, MAX_NOTIFICATION_STREAMS_PER_USER);
      const removed = recordingSubscriber();
      const kept = recordingSubscriber();
      const unsubscribe = hub.subscribe(USER_A, removed.subscriber);
      hub.subscribe(USER_A, kept.subscriber);

      unsubscribe();
      unsubscribe();
      hub.publish(USER_A, notice("after"));

      await waitUntil(() => kept.received.length === 1);
      expect(removed.received).toEqual([]);
      expect(removed.close).not.toHaveBeenCalled();
    });
  });

  describe("bounded queue", () => {
    it("closes and removes an overflowing subscriber once, and leaves the others delivering", async () => {
      const { logger } = loggerSpy();
      const hub = createNotificationHub(logger, 2, MAX_NOTIFICATION_STREAMS_PER_USER);
      const slow = blockedSubscriber();
      const healthy = recordingSubscriber();
      hub.subscribe(USER_A, slow.subscriber);
      hub.subscribe(USER_A, healthy.subscriber);

      hub.publish(USER_A, notice("n1"));
      hub.publish(USER_A, notice("n2"));
      await waitUntil(() => healthy.received.length === 2);
      hub.publish(USER_A, notice("n3"));
      hub.publish(USER_A, notice("n4"));

      await waitUntil(() => healthy.received.length === 4);
      expect(healthy.received).toEqual(["n1", "n2", "n3", "n4"]);
      expect(slow.close).toHaveBeenCalledTimes(1);
      expect(slow.send).toHaveBeenCalledTimes(1);
    });
  });

  describe("failing send", () => {
    it("closes the subscriber whose send rejects and logs only the error type", async () => {
      const { logger, warn } = loggerSpy();
      const hub = createNotificationHub(logger, 10, MAX_NOTIFICATION_STREAMS_PER_USER);
      const failing = {
        send: vi.fn(async () => {
          throw new TypeError("secret detail");
        }),
        close: vi.fn(),
      };
      const healthy = recordingSubscriber();
      hub.subscribe(USER_A, failing);
      hub.subscribe(USER_A, healthy.subscriber);

      hub.publish(USER_A, notice("n1", { eventId: "private-event" }));

      await waitUntil(() => healthy.received.length === 1 && failing.close.mock.calls.length === 1);
      expect(warn).toHaveBeenCalledWith("notification stream closed after a failed send", {
        error: "TypeError",
      });
      const logged = JSON.stringify(warn.mock.calls);
      expect(logged).not.toContain("secret detail");
      expect(logged).not.toContain("private-event");
      expect(logged).not.toContain(USER_A);
    });
  });

  describe("close", () => {
    it("closes every subscriber, ignores later publishes and closes later subscribers at once", async () => {
      const { logger } = loggerSpy();
      const hub = createNotificationHub(logger, 10, MAX_NOTIFICATION_STREAMS_PER_USER);
      const first = recordingSubscriber();
      const second = recordingSubscriber();
      hub.subscribe(USER_A, first.subscriber);
      hub.subscribe(USER_B, second.subscriber);

      hub.close();
      hub.publish(USER_A, notice("late"));
      const lateSubscriber = recordingSubscriber();
      const unsubscribe = hub.subscribe(USER_A, lateSubscriber.subscriber);
      unsubscribe();

      expect(first.close).toHaveBeenCalledTimes(1);
      expect(second.close).toHaveBeenCalledTimes(1);
      expect(first.received).toEqual([]);
      expect(lateSubscriber.close).toHaveBeenCalledTimes(1);
      expect(lateSubscriber.received).toEqual([]);
    });
  });

  describe("streams per person", () => {
    it("closes the oldest stream of a person who opens one more than the cap", async () => {
      const { logger } = loggerSpy();
      const hub = createNotificationHub(logger, 10, 2);
      const first = recordingSubscriber();
      const second = recordingSubscriber();
      const third = recordingSubscriber();
      hub.subscribe(USER_A, first.subscriber);
      hub.subscribe(USER_A, second.subscriber);
      hub.subscribe(USER_A, third.subscriber);

      hub.publish(USER_A, notice("n1"));

      await waitUntil(() => second.received.length === 1 && third.received.length === 1);
      expect(first.close).toHaveBeenCalledTimes(1);
      expect(first.received).toEqual([]);
      expect(second.close).not.toHaveBeenCalled();
      expect(second.received).toEqual(["n1"]);
    });

    it("leaves another person's streams open when one person is over the cap", async () => {
      const { logger } = loggerSpy();
      const hub = createNotificationHub(logger, 10, 1);
      const anna = recordingSubscriber();
      const ben = recordingSubscriber();
      const annaNew = recordingSubscriber();
      hub.subscribe(USER_A, anna.subscriber);
      hub.subscribe(USER_B, ben.subscriber);
      hub.subscribe(USER_A, annaNew.subscriber);

      expect(anna.close).toHaveBeenCalledTimes(1);
      expect(ben.close).not.toHaveBeenCalled();

      hub.publish(USER_B, notice("for-b"));
      await waitUntil(() => ben.received.length === 1);
      expect(ben.received).toEqual(["for-b"]);
    });

    it("closes an evicted stream only once and tolerates its late unsubscribe", () => {
      const { logger } = loggerSpy();
      const hub = createNotificationHub(logger, 10, 1);
      const evicted = recordingSubscriber();
      const unsubscribeEvicted = hub.subscribe(USER_A, evicted.subscriber);
      hub.subscribe(USER_A, recordingSubscriber().subscriber);

      unsubscribeEvicted();
      unsubscribeEvicted();

      expect(evicted.close).toHaveBeenCalledTimes(1);
    });
  });
});
