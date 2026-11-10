// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import type { Logger } from "@offgrid/observability";
import { sendWithRetry } from "./send-with-retry.js";

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

const UNREACHABLE = Object.assign(new Error("down"), { code: "ECONNECTION" });

describe("sendWithRetry", () => {
  it("sends once and logs nothing when the first attempt works", async () => {
    const logger = fakeLogger();
    const attempt = vi.fn(async () => undefined);

    sendWithRetry(attempt, [0], logger, { channel: "email" });

    await vi.waitFor(() => expect(attempt).toHaveBeenCalledTimes(1));
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("retries after a failure and stops once an attempt succeeds", async () => {
    const logger = fakeLogger();
    const attempt = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(UNREACHABLE)
      .mockResolvedValueOnce(undefined);

    sendWithRetry(attempt, [0, 0], logger, { channel: "email" });

    await vi.waitFor(() => expect(attempt).toHaveBeenCalledTimes(2));
    expect(logger.warn).toHaveBeenCalledWith(
      "email delivery failed, retrying",
      expect.objectContaining({ attempt: 1, retryInMs: 0, reason: "UNREACHABLE" }),
    );
  });

  it("gives up after the last configured retry and logs no address", async () => {
    const logger = fakeLogger();
    const attempt = vi.fn(async () => {
      throw UNREACHABLE;
    });

    sendWithRetry(attempt, [0], logger, { channel: "email" });

    await vi.waitFor(() =>
      expect(logger.warn).toHaveBeenLastCalledWith("email delivery gave up", {
        channel: "email",
        attempts: 2,
        reason: "UNREACHABLE",
      }),
    );
    expect(attempt).toHaveBeenCalledTimes(2);
  });
});
