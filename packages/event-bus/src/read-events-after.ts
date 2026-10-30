// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { StoredEvent, EventRow } from "./types.js";
import { toStoredEvent } from "./to-stored-event.js";

export const readEventsAfter = async (
  client: ClientBase,
  after: number,
  type: string | null,
  limit: number,
): Promise<StoredEvent[]> => {
  const { rows } = await client.query<EventRow>("SELECT * FROM outbox.events_after($1, $2, $3)", [
    after,
    type,
    limit,
  ]);
  return rows.map(toStoredEvent);
};
