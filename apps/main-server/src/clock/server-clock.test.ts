// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createServerClock } from "./server-clock.js";

const FROZEN = new Date("2026-11-20T08:45:00Z");

describe("server clock", () => {
  it("reads the real time and has no control when the e2e seam is off", () => {
    const clock = createServerClock({ controlled: false });

    expect(clock.control).toBeUndefined();
    expect(clock.pollIntervalMs).toBe(30_000);
    expect(Math.abs(clock.now().getTime() - Date.now())).toBeLessThan(1_000);
  });

  it("reads the frozen instant after the seam freezes it, and the real time after release", async () => {
    const clock = createServerClock({ controlled: true });
    const polling = setInterval(() => clock.now(), 5);
    try {
      await clock.control?.freezeAndAwaitPolls(FROZEN);
      expect(clock.now()).toEqual(FROZEN);
      clock.control?.release();
      expect(Math.abs(clock.now().getTime() - Date.now())).toBeLessThan(1_000);
    } finally {
      clearInterval(polling);
    }
  });

  it("fails when the worker never polls the clock", async () => {
    const clock = createServerClock({ controlled: true });
    await expect(clock.control?.freezeAndAwaitPolls(FROZEN)).rejects.toThrow(
      "did not poll the clock",
    );
  }, 10_000);
});
