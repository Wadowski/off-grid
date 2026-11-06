// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { AttemptCounterRecord } from "../../types.js";

export const findAttemptCounter = async (
  tx: ModuleTransaction,
  key: string,
): Promise<AttemptCounterRecord | null> => {
  const counter = await tx.attemptCounter.findUnique({ where: { attemptKey: key } });
  return counter === null
    ? null
    : {
        failures: counter.failures,
        lockedUntil: counter.lockedUntil,
        requestedAt: counter.requestedAt,
      };
};
