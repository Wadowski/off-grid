// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { deleteAttemptCounter } from "../../infrastructure/attempt-counters/delete-attempt-counter.js";

export const clearFailedAttempts = (db: ModuleDatabase, key: string): Promise<void> =>
  db.$transaction((tx) => deleteAttemptCounter(tx, key));
