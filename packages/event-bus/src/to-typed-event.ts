// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { type AnyEventDefinition, parseEvent } from "@offgrid/contracts";
import type { StoredEvent, EventOf } from "./types.js";

export const toTypedEvent = <D extends AnyEventDefinition>(
  definition: D,
  row: StoredEvent,
): EventOf<D> => {
  return parseEvent(definition, {
    id: row.id,
    type: row.type,
    version: row.version,
    occurredAt: row.occurredAt,
    traceId: row.traceId,
    familyId: row.familyId,
    sourceVersion: row.sourceVersion,
    payload: row.payload,
  }) as EventOf<D>;
};
