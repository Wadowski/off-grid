// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { parseEvent, type AnyEventDefinition } from "@offgrid/contracts";
import type { ClientBase } from "pg";
import { appendEvent } from "./store.js";
import type { NewEvent, PublishOptions } from "./types.js";

export async function publish(
  tx: ClientBase,
  definition: AnyEventDefinition,
  input: unknown,
  options: PublishOptions = {},
): Promise<number> {
  const event = parseEvent(definition, input);
  const owner = ownerOf(event.familyId, options.userId);
  return appendEvent(tx, {
    id: event.id,
    type: event.type,
    version: event.version,
    sourceVersion: event.sourceVersion,
    traceId: event.traceId,
    occurredAt: event.occurredAt,
    familyId: owner.familyId,
    userId: owner.userId,
    payload: event.payload,
  } satisfies NewEvent);
}

function ownerOf(
  familyId: string | null,
  userId: string | undefined,
): { familyId: string | null; userId: string | null } {
  if (familyId !== null && userId === undefined) {
    return { familyId, userId: null };
  }
  if (familyId === null && userId !== undefined) {
    return { familyId: null, userId };
  }
  throw new Error("an event has exactly one owner: a family, or a user when it has no family");
}
