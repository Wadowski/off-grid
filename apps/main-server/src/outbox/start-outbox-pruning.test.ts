// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EventBus } from "@offgrid/event-bus";
import type { Logger } from "@offgrid/observability";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OUTBOX_PRUNE_INTERVAL_MS, SECONDS_PER_DAY } from "../constants.js";
import { startOutboxPruning } from "./start-outbox-pruning.js";

describe("startOutboxPruning", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("prunes at start and on each interval with the retention in seconds, and stops", async () => {
    const prune = vi.fn(async () => 0);
    const warn = vi.fn();
    const stop = startOutboxPruning({ prune } as unknown as EventBus, 7, {
      warn,
    } as unknown as Logger);

    expect(prune).toHaveBeenCalledWith(7 * SECONDS_PER_DAY);
    await vi.advanceTimersByTimeAsync(OUTBOX_PRUNE_INTERVAL_MS);
    expect(prune).toHaveBeenCalledTimes(2);

    stop();
    await vi.advanceTimersByTimeAsync(OUTBOX_PRUNE_INTERVAL_MS * 3);
    expect(prune).toHaveBeenCalledTimes(2);
  });

  it("logs a failed prune with the error name only", async () => {
    const prune = vi.fn(async () => {
      throw new TypeError("connection lost");
    });
    const warn = vi.fn();
    const stop = startOutboxPruning({ prune } as unknown as EventBus, 7, {
      warn,
    } as unknown as Logger);

    await vi.advanceTimersByTimeAsync(0);
    expect(warn).toHaveBeenCalledWith("outbox pruning failed", {
      action: "outbox.prune-failed",
      reason: "TypeError",
    });
    stop();
  });
});
