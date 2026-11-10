// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Logger } from "@offgrid/observability";
import { describe, expect, it, vi } from "vitest";
import type { InboxNotice, NotificationChannel } from "../../types.js";
import { deliverToChannels } from "./deliver-to-channels.js";

const notice: InboxNotice = {
  notificationId: "3f1c6a7e-7d0f-4c1e-9b8a-2f5d6e7a8b9c",
  userId: "5a6b7c8d-9e0f-4a1b-8c2d-3e4f5a6b7c8d",
  type: "password-changed",
  data: {},
};

const loggerSpy = () => {
  const warn = vi.fn();
  const logger = { debug: vi.fn(), info: vi.fn(), warn, error: vi.fn(), child: vi.fn() };
  return { logger: logger as unknown as Logger, warn };
};

describe("deliverToChannels", () => {
  it("keeps delivering to the other channels when one throws synchronously", async () => {
    const delivered: string[] = [];
    const throwing: NotificationChannel = {
      name: "throwing",
      deliver: () => {
        throw new TypeError("broke at once");
      },
    };
    const working: NotificationChannel = {
      name: "working",
      deliver: async () => {
        delivered.push("working");
      },
    };
    const { logger, warn } = loggerSpy();

    await expect(deliverToChannels([throwing, working], notice, logger)).resolves.toBeUndefined();

    expect(delivered).toEqual(["working"]);
    expect(warn).toHaveBeenCalledWith("notification channel failed", {
      channel: "throwing",
      error: "TypeError",
    });
  });

  it("logs only the channel name and error type when a channel rejects", async () => {
    const failing: NotificationChannel = {
      name: "failing",
      deliver: async () => {
        throw new Error("secret detail");
      },
    };
    const { logger, warn } = loggerSpy();

    await deliverToChannels([failing], notice, logger);

    expect(warn).toHaveBeenCalledWith("notification channel failed", {
      channel: "failing",
      error: "Error",
    });
    expect(JSON.stringify(warn.mock.calls)).not.toContain("secret detail");
  });
});
