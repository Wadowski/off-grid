// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

// The instant that background work reads. Only the reminder worker reads it today.
// Test seam for time only: when OFFGRID_E2E_CLOCK is "on" the e2e routes can freeze it.
// The seam changes what the worker reads and writes no rows, so it cannot set up state.
export interface ControlledClock {
  // Freezes the clock at an instant and returns after two background polls have run at it.
  freezeAndAwaitPolls(instant: Date): Promise<void>;
  release(): void;
}

export interface ServerClock {
  now(): Date;
  // How often background work polls the clock. Shortened only while the e2e seam is on.
  readonly pollIntervalMs: number;
  readonly control?: ControlledClock;
}

const PRODUCTION_POLL_MS = 30_000;
const CONTROLLED_POLL_MS = 250;
const POLL_TIMEOUT_MS = 5_000;
const POLL_CHECK_MS = 20;
const POLLS_TO_WAIT_FOR = 2;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const createServerClock = (options: { controlled: boolean }): ServerClock => {
  let frozen: Date | undefined;
  let reads = 0;

  const clock: ServerClock = {
    now: () => {
      reads += 1;
      return frozen === undefined ? new Date() : new Date(frozen);
    },
    pollIntervalMs: options.controlled ? CONTROLLED_POLL_MS : PRODUCTION_POLL_MS,
  };

  if (!options.controlled) {
    return clock;
  }

  return {
    ...clock,
    control: {
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
    },
  };
};
