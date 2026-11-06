// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { ERROR_RECORD_RETENTION_MS } from "../constants.js";

export const pruneErrorRecords = async (db: ModuleDatabase, now: Date): Promise<number> => {
  const { count } = await db.errorRecord.deleteMany({
    where: { recordedAt: { lt: new Date(now.getTime() - ERROR_RECORD_RETENTION_MS) } },
  });
  return count;
};
