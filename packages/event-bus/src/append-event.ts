// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NewEvent, SqlExecutor } from "./types.js";

export const appendEvent = async (client: SqlExecutor, event: NewEvent): Promise<number> => {
  const { rows } = await client.query<{ sequence: string }>(
    "SELECT outbox.append_event($1, $2, $3, $4, $5, $6, $7, $8, $9) AS sequence",
    [
      event.id,
      event.type,
      event.version,
      event.sourceVersion,
      event.traceId,
      event.occurredAt,
      event.familyId,
      event.userId,
      JSON.stringify(event.payload),
    ],
  );
  return Number(rows[0]?.sequence);
};
