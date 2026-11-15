// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createControlledClock } from "./controlled-clock.js";

const FROZEN = new Date("2026-11-20T08:45:00Z");

describe("controlled clock", () => {
  it("reads the real time before any freeze, polls every 250 milliseconds", () => {
    const { clock } = createControlledClock();

    expect(clock.pollIntervalMs).toBe(250);
    expect(Math.abs(clock.now().getTime() - Date.now())).toBeLessThan(1_000);
  });

  it("reads the frozen instant after the seam freezes it, and the real time after release", async () => {
    const controlled = createControlledClock();
    const polling = setInterval(() => controlled.clock.now(), 5);
    try {
      await controlled.freezeAndAwaitPolls(FROZEN);
      expect(controlled.clock.now()).toEqual(FROZEN);
      controlled.release();
      expect(Math.abs(controlled.clock.now().getTime() - Date.now())).toBeLessThan(1_000);
    } finally {
      clearInterval(polling);
    }
  });

  it("fails when the worker never polls the clock", async () => {
    const controlled = createControlledClock();
    await expect(controlled.freezeAndAwaitPolls(FROZEN)).rejects.toThrow("did not poll the clock");
  }, 10_000);
});
