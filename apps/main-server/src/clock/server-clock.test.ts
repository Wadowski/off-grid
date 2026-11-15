// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createServerClock } from "./server-clock.js";

describe("server clock", () => {
  it("reads the real time and polls every 30 seconds", () => {
    const clock = createServerClock();

    expect(clock.pollIntervalMs).toBe(30_000);
    expect(Math.abs(clock.now().getTime() - Date.now())).toBeLessThan(1_000);
  });
});
