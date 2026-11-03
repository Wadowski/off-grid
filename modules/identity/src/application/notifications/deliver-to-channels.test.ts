// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import type { Logger } from "@offgrid/observability";
import type { NewNotification, NotificationChannel } from "../../types.js";
import { deliverToChannels } from "./deliver-to-channels.js";

const notification: NewNotification = {
  id: "7b1c2d3e-0000-4000-8000-000000000001",
  userId: "7b1c2d3e-0000-4000-8000-000000000002",
  type: "password-changed",
  data: {},
};

const fakeLogger = (): Logger & { warn: ReturnType<typeof vi.fn> } => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: () => logger,
  };
  return logger;
};

describe("deliverToChannels", () => {
  it("hands the notification to every channel", async () => {
    const delivered: NewNotification[] = [];
    const channel: NotificationChannel = {
      name: "fake",
      deliver: async (item) => {
        delivered.push(item);
      },
    };

    await deliverToChannels([channel], notification, fakeLogger());

    expect(delivered).toEqual([notification]);
  });

  it("keeps delivering when one channel fails, and never throws", async () => {
    const reached = vi.fn();
    const failing: NotificationChannel = {
      name: "broken",
      deliver: () => Promise.reject(new TypeError("smtp down for user@example.com")),
    };
    const working: NotificationChannel = { name: "working", deliver: async () => reached() };
    const logger = fakeLogger();

    await expect(
      deliverToChannels([failing, working], notification, logger),
    ).resolves.toBeUndefined();

    expect(reached).toHaveBeenCalledOnce();
    expect(logger.warn).toHaveBeenCalledWith("notification channel failed", {
      channel: "broken",
      error: "TypeError",
    });
  });

  it("keeps delivering when a channel throws synchronously instead of returning a promise", async () => {
    const reached = vi.fn();
    const throwing: NotificationChannel = {
      name: "sync-broken",
      deliver: () => {
        throw new TypeError("boom");
      },
    };
    const working: NotificationChannel = { name: "working", deliver: async () => reached() };
    const logger = fakeLogger();

    await expect(
      deliverToChannels([throwing, working], notification, logger),
    ).resolves.toBeUndefined();

    expect(reached).toHaveBeenCalledOnce();
    expect(logger.warn).toHaveBeenCalledWith("notification channel failed", {
      channel: "sync-broken",
      error: "TypeError",
    });
  });

  it("logs the error name only, never the message or the notification", async () => {
    const logger = fakeLogger();
    const failing: NotificationChannel = {
      name: "broken",
      deliver: () => Promise.reject(new Error("private detail")),
    };

    await deliverToChannels([failing], notification, logger);

    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain("private detail");
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain(notification.userId);
  });
});
