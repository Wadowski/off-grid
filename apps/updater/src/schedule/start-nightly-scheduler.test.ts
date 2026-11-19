// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createManualClock } from "../../test/manual-clock.js";
import { createSilentLogger } from "../../test/silent-logger.js";
import { waitUntil } from "../../test/wait-until.js";
import type { NightlyRunResult } from "../types.js";
import { startNightlyScheduler } from "./start-nightly-scheduler.js";

const NIGHTLY_TIME = { hour: 3, minute: 30 };
const START = new Date(2026, 10, 19, 10, 0);
const FIRST_SLOT = new Date(2026, 10, 20, 3, 30);
const SECOND_SLOT = new Date(2026, 10, 21, 3, 30);
const ONE_MINUTE_BEFORE_FIRST_SLOT = new Date(2026, 10, 20, 3, 29);

interface SchedulerHarness {
  readonly clock: ReturnType<typeof createManualClock>;
  readonly ticks: number[];
  readonly stop: () => void;
}

const startWith = (
  runTick: (tickNumber: number) => Promise<NightlyRunResult>,
): SchedulerHarness => {
  const clock = createManualClock(START);
  const ticks: number[] = [];
  const stop = startNightlyScheduler({
    clock,
    nightlyTime: NIGHTLY_TIME,
    logger: createSilentLogger(),
    runTick: async () => {
      ticks.push(ticks.length + 1);
      return runTick(ticks.length);
    },
  });
  return { clock, ticks, stop };
};

const alwaysApplied = async (): Promise<NightlyRunResult> => "applied";

describe("startNightlyScheduler", () => {
  it("does not tick on start and waits for the next 03:30 slot", async () => {
    const harness = startWith(alwaysApplied);
    await waitUntil(() => harness.clock.pendingSleeps() === 1);

    harness.clock.advanceTo(ONE_MINUTE_BEFORE_FIRST_SLOT);
    await waitUntil(() => harness.clock.pendingSleeps() === 1);

    expect(harness.ticks).toEqual([]);
    harness.stop();
  });

  it("ticks once per night at the slot", async () => {
    const harness = startWith(alwaysApplied);
    await waitUntil(() => harness.clock.pendingSleeps() === 1);

    harness.clock.advanceTo(FIRST_SLOT);
    await waitUntil(() => harness.ticks.length === 1);
    await waitUntil(() => harness.clock.pendingSleeps() === 1);
    harness.clock.advanceTo(SECOND_SLOT);
    await waitUntil(() => harness.ticks.length === 2);

    expect(harness.ticks).toEqual([1, 2]);
    harness.stop();
  });

  it("does not retry a failed night that finishes after the slot", async () => {
    let releaseFirstTick: () => void = () => undefined;
    const firstTickFinished = new Promise<void>((resolve) => {
      releaseFirstTick = resolve;
    });
    const harness = startWith(async (tickNumber) => {
      if (tickNumber === 1) {
        await firstTickFinished;
        return "failed";
      }
      return "applied";
    });
    await waitUntil(() => harness.clock.pendingSleeps() === 1);

    harness.clock.advanceTo(FIRST_SLOT);
    await waitUntil(() => harness.ticks.length === 1);
    harness.clock.advanceTo(new Date(2026, 10, 20, 4, 15));
    releaseFirstTick();
    await waitUntil(() => harness.clock.pendingSleeps() === 1);

    expect(harness.ticks).toEqual([1]);
    harness.clock.advanceTo(SECOND_SLOT);
    await waitUntil(() => harness.ticks.length === 2);
    expect(harness.ticks).toEqual([1, 2]);
    harness.stop();
  });

  it("keeps running after a tick throws", async () => {
    const harness = startWith(async (tickNumber) => {
      if (tickNumber === 1) {
        throw new Error("unexpected");
      }
      return "applied";
    });
    await waitUntil(() => harness.clock.pendingSleeps() === 1);

    harness.clock.advanceTo(FIRST_SLOT);
    await waitUntil(() => harness.ticks.length === 1);
    await waitUntil(() => harness.clock.pendingSleeps() === 1);
    harness.clock.advanceTo(SECOND_SLOT);
    await waitUntil(() => harness.ticks.length === 2);

    expect(harness.ticks).toEqual([1, 2]);
    harness.stop();
  });

  it("does not tick after stop", async () => {
    const harness = startWith(alwaysApplied);
    await waitUntil(() => harness.clock.pendingSleeps() === 1);

    harness.stop();
    harness.clock.advanceTo(FIRST_SLOT);
    await waitUntil(() => harness.clock.pendingSleeps() === 0);

    expect(harness.ticks).toEqual([]);
  });
});
