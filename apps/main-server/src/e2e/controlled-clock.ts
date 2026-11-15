// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerClock } from "../clock/server-clock.js";
import { sleep } from "./sleep.js";

const CONTROLLED_POLL_MS = 250;
const POLL_TIMEOUT_MS = 5_000;
const POLL_CHECK_MS = 20;
const POLLS_TO_WAIT_FOR = 2;

export interface ControlledClock {
  readonly clock: ServerClock;
  freezeAndAwaitPolls(instant: Date): Promise<void>;
  release(): void;
}

export const createControlledClock = (): ControlledClock => {
  let frozen: Date | undefined;
  let reads = 0;

  const clock: ServerClock = {
    now: () => {
      reads += 1;
      return frozen === undefined ? new Date() : new Date(frozen);
    },
    pollIntervalMs: CONTROLLED_POLL_MS,
  };

  return {
    clock,
    freezeAndAwaitPolls: async (instant: Date) => {
      frozen = instant;
      const target = reads + POLLS_TO_WAIT_FOR;
      const deadline = Date.now() + POLL_TIMEOUT_MS;
      while (reads < target) {
        if (Date.now() > deadline) {
          throw new Error("the background worker did not poll the clock in time");
        }
        await sleep(POLL_CHECK_MS);
      }
    },
    release: () => {
      frozen = undefined;
    },
  };
};
