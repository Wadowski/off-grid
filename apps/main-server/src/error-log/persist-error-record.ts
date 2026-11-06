// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ModuleDatabase } from "@offgrid/db";
import type { ErrorRecord, Logger } from "@offgrid/observability";

export const persistErrorRecord = async (
  db: ModuleDatabase,
  logger: Logger,
  record: ErrorRecord,
): Promise<void> => {
  try {
    await db.errorRecord.create({
      data: {
        errorRecordId: randomUUID(),
        recordedAt: new Date(record.recorded_at),
        name: record.name,
        code: record.code ?? null,
        traceId: record.trace_id ?? null,
        context: JSON.parse(JSON.stringify(record.context ?? {})),
      },
    });
  } catch (error) {
    logger.warn("error record not stored", {
      action: "error-record.not-stored",
      reason: error instanceof Error ? error.name : "NonError",
    });
  }
};
