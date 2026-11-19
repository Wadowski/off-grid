// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ManualClock } from "./types.js";

interface PendingSleep {
  readonly dueAt: number;
  readonly resolve: () => void;
}

export const createManualClock = (start: Date): ManualClock => {
  let current = start.getTime();
  let pending: PendingSleep[] = [];
  return {
    now: () => current,
    sleep: (milliseconds) =>
      new Promise<void>((resolve) => {
        pending.push({ dueAt: current + milliseconds, resolve });
      }),
    advanceTo: (time) => {
      current = time.getTime();
      const due = pending.filter((sleep) => sleep.dueAt <= current);
      pending = pending.filter((sleep) => sleep.dueAt > current);
      due.forEach((sleep) => sleep.resolve());
    },
    pendingSleeps: () => pending.length,
  };
};
