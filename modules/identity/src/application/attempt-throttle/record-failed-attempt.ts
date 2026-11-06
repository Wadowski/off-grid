// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { incrementFailedAttempts } from "../../infrastructure/attempt-counters/increment-failed-attempts.js";
import { lockAttempts } from "../../infrastructure/attempt-counters/lock-attempts.js";
import type { AttemptPolicy } from "../../types.js";

export const recordFailedAttempt = (
  db: ModuleDatabase,
  key: string,
  policy: AttemptPolicy,
  now: Date,
): Promise<void> =>
  db.$transaction(async (tx) => {
    const failures = await incrementFailedAttempts(tx, key, now);
    if (failures >= policy.limit) {
      await lockAttempts(tx, key, new Date(now.getTime() + policy.lockoutMs), now);
    }
  });
