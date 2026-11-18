// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createFakeClock } from "../../test/fake-clock.js";
import { waitForHealth } from "./wait-for-health.js";

const probeAnsweringAfter = (healthyOnCall: number) => {
  let calls = 0;
  return {
    probe: async () => {
      calls += 1;
      return calls >= healthyOnCall;
    },
    calls: () => calls,
  };
};

describe("waitForHealth", () => {
  it("returns true as soon as the probe answers healthy", async () => {
    const clock = createFakeClock();
    const probe = probeAnsweringAfter(3);

    const healthy = await waitForHealth(probe.probe, clock, 60000);

    expect(healthy).toBe(true);
    expect(probe.calls()).toBe(3);
    expect(clock.elapsed()).toBe(2000);
  });

  it("returns false once the timeout has passed", async () => {
    const clock = createFakeClock();
    const probe = probeAnsweringAfter(Number.POSITIVE_INFINITY);

    const healthy = await waitForHealth(probe.probe, clock, 3000);

    expect(healthy).toBe(false);
    expect(probe.calls()).toBe(4);
    expect(clock.elapsed()).toBe(3000);
  });

  it("probes once and gives up at a zero timeout", async () => {
    const clock = createFakeClock();
    const probe = probeAnsweringAfter(Number.POSITIVE_INFINITY);

    const healthy = await waitForHealth(probe.probe, clock, 0);

    expect(healthy).toBe(false);
    expect(probe.calls()).toBe(1);
  });
});
