// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_TIMER_DELAY_MS } from "../../constants.js";
import { scheduleStreamExpiry } from "./schedule-stream-expiry.js";

const NOW = Date.parse("2026-05-01T10:00:00.000Z");

describe("scheduleStreamExpiry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls back at the access expiry and not before", async () => {
    const onExpired = vi.fn();
    scheduleStreamExpiry(new Date(NOW + 5_000), NOW, onExpired);

    await vi.advanceTimersByTimeAsync(4_999);
    expect(onExpired).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it("calls back straight away when the expiry is already past", async () => {
    const onExpired = vi.fn();
    scheduleStreamExpiry(new Date(NOW - 1_000), NOW, onExpired);

    await vi.advanceTimersByTimeAsync(0);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it("does not call back after the stop function runs", async () => {
    const onExpired = vi.fn();
    const stop = scheduleStreamExpiry(new Date(NOW + 5_000), NOW, onExpired);

    stop();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(onExpired).not.toHaveBeenCalled();
  });

  it("clamps a delay longer than a timer can hold", async () => {
    const onExpired = vi.fn();
    scheduleStreamExpiry(new Date(NOW + MAX_TIMER_DELAY_MS * 3), NOW, onExpired);

    await vi.advanceTimersByTimeAsync(MAX_TIMER_DELAY_MS);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });
});
