// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { type AnyEventDefinition, parseEvent } from "@offgrid/contracts";
import type { NewEvent, PublishOptions, SqlExecutor } from "./types.js";
import { ownerOf } from "./owner-of.js";
import { appendEvent } from "./append-event.js";

export const publish = async (
  tx: SqlExecutor,
  definition: AnyEventDefinition,
  input: unknown,
  options: PublishOptions = {},
): Promise<number> => {
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
};
