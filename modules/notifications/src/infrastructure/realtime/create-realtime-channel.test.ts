// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationType } from "@offgrid/contracts";
import type { Logger } from "@offgrid/observability";
import { describe, expect, it, vi } from "vitest";
import type {
  InboxNotice,
  ListedNotification,
  NoticeSubscriber,
  NotificationHub,
} from "../../types.js";
import { createNotificationHub } from "./create-notification-hub.js";
import { createRealtimeChannel } from "./create-realtime-channel.js";
import { MAX_NOTIFICATION_STREAMS_PER_USER } from "../../constants.js";

const USER_A = "5a6b7c8d-9e0f-4a1b-8c2d-3e4f5a6b7c8d";
const USER_B = "0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e";
const CREATED_AT = new Date("2026-05-01T10:00:00.000Z");

const inboxNotice = (
  notificationId: string,
  userId: string,
  type: string = "password-changed",
): InboxNotice => ({
  notificationId,
  userId,
  type,
  data: { eventId: "event-1" },
  createdAt: CREATED_AT,
});

const recordingHub = (): NotificationHub & { publish: ReturnType<typeof vi.fn> } => ({
  subscribe: vi.fn(() => () => undefined),
  publish: vi.fn(),
  close: vi.fn(),
});

const recordingSubscriber = () => {
  const received: string[] = [];
  const subscriber: NoticeSubscriber = {
    send: async (item) => {
      received.push(item.id);
    },
    close: vi.fn(),
  };
  return { subscriber, received };
};

const loggerSpy = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn(),
  }) as unknown as Logger;

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

const listedPayload = (
  notificationId: string,
  type: NotificationType,
  category: ListedNotification["category"],
): ListedNotification => ({
  id: notificationId,
  type,
  category,
  data: { eventId: "event-1" },
  createdAt: "2026-05-01T10:00:00.000Z",
  readAt: null,
});

describe("createRealtimeChannel", () => {
  it("is named realtime", () => {
    expect(createRealtimeChannel(recordingHub()).name).toBe("realtime");
  });

  it.each([
    ["password-changed", "account-security"],
    ["recovery-code-regenerated", "account-security"],
    ["event-invited", "calendar"],
    ["event-reminder", "calendar"],
  ] as const)(
    "publishes a %s notice as a list item in the %s category to the notice's user",
    async (type, category) => {
      const hub = recordingHub();

      await createRealtimeChannel(hub).deliver(inboxNotice("n1", USER_A, type));

      expect(hub.publish).toHaveBeenCalledTimes(1);
      expect(hub.publish).toHaveBeenCalledWith(USER_A, listedPayload("n1", type, category));
    },
  );

  it("rejects a notice whose type is not a known notification type and publishes nothing", async () => {
    const hub = recordingHub();

    await expect(
      createRealtimeChannel(hub).deliver(inboxNotice("n1", USER_A, "unknown-type")),
    ).rejects.toThrow();

    expect(hub.publish).not.toHaveBeenCalled();
  });

  it("delivers each notice only to subscribers of the notice's user", async () => {
    const hub = createNotificationHub(loggerSpy(), 10, MAX_NOTIFICATION_STREAMS_PER_USER);
    const userA = recordingSubscriber();
    const userB = recordingSubscriber();
    hub.subscribe(USER_A, userA.subscriber);
    hub.subscribe(USER_B, userB.subscriber);
    const channel = createRealtimeChannel(hub);

    await channel.deliver(inboxNotice("for-a", USER_A));
    await channel.deliver(inboxNotice("for-b", USER_B));

    await waitUntil(() => userA.received.length === 1 && userB.received.length === 1);
    expect(userA.received).toEqual(["for-a"]);
    expect(userB.received).toEqual(["for-b"]);
  });
});
