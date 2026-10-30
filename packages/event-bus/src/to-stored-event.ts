// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EventRow, StoredEvent } from "./types.js";

export const toStoredEvent = (row: EventRow): StoredEvent => {
  return {
    sequence: Number(row.sequence),
    id: row.id,
    type: row.type,
    version: row.version,
    sourceVersion: Number(row.source_version),
    traceId: row.trace_id,
    occurredAt: row.occurred_at.toISOString(),
    familyId: row.family_id,
    payload: row.payload,
  };
};
