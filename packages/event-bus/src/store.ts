// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { EventRow, NewEvent, StoredEvent } from "./types.js";

export async function appendEvent(client: ClientBase, event: NewEvent): Promise<number> {
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
}

export async function lockCursor(client: ClientBase, subscriber: string): Promise<number | null> {
  const { rows } = await client.query<{ position: string | null }>(
    "SELECT outbox.lock_cursor($1) AS position",
    [subscriber],
  );
  const position = rows[0]?.position;
  return position === null || position === undefined ? null : Number(position);
}

export async function advanceCursor(
  client: ClientBase,
  subscriber: string,
  sequence: number,
): Promise<void> {
  await client.query("SELECT outbox.advance_cursor($1, $2)", [subscriber, sequence]);
}

export async function readEventsAfter(
  client: ClientBase,
  after: number,
  type: string | null,
  limit: number,
): Promise<StoredEvent[]> {
  const { rows } = await client.query<EventRow>("SELECT * FROM outbox.events_after($1, $2, $3)", [
    after,
    type,
    limit,
  ]);
  return rows.map(toStoredEvent);
}

export async function recordDeadLetter(
  client: ClientBase,
  subscriber: string,
  sequence: number,
  attempts: number,
  errorName: string,
): Promise<void> {
  await client.query("SELECT outbox.record_dead_letter($1, $2, $3, $4)", [
    subscriber,
    sequence,
    attempts,
    errorName,
  ]);
}

export async function pruneDelivered(
  client: ClientBase,
  retentionSeconds: number,
): Promise<number> {
  const { rows } = await client.query<{ prune_delivered: string }>(
    "SELECT outbox.prune_delivered($1) AS prune_delivered",
    [retentionSeconds],
  );
  return Number(rows[0]?.prune_delivered);
}

export async function setRole(client: ClientBase, runAs: string): Promise<void> {
  await client.query(`SET ROLE ${roleOf(runAs)}`);
}

export async function resetRole(client: ClientBase): Promise<void> {
  await client.query("RESET ROLE");
}

export function roleOf(runAs: string): string {
  if (!/^[a-z][a-z0-9]*$/.test(runAs)) {
    throw new Error(`invalid module name for a subscriber: ${JSON.stringify(runAs)}`);
  }
  return `${runAs}_app`;
}

function toStoredEvent(row: EventRow): StoredEvent {
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
}
