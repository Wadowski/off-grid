// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { findAttemptCounter } from "../../infrastructure/attempt-counters/find-attempt-counter.js";

export const isAttemptLocked = (db: ModuleDatabase, key: string, now: Date): Promise<boolean> =>
  db.$transaction(async (tx) => {
    const counter = await findAttemptCounter(tx, key);
    return counter !== null && counter.lockedUntil !== null && counter.lockedUntil > now;
  });
