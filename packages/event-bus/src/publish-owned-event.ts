// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { AnyEventDefinition } from "@offgrid/contracts";
import { currentTraceId, resolveTraceId } from "@offgrid/observability";
import { publish } from "./publish.js";
import type { SqlExecutor } from "./types.js";

export interface EventOwner {
  readonly familyId?: string | null;
  readonly userId?: string | null;
  readonly sourceVersion?: number;
}

// Builds the envelope every module needs and publishes it in the caller's transaction.
export const publishOwnedEvent = (
  executor: SqlExecutor,
  definition: AnyEventDefinition,
  owner: EventOwner,
  payload: unknown,
): Promise<number> =>
  publish(
    executor,
    definition,
    {
      id: randomUUID(),
      type: definition.name,
      version: definition.version,
      occurredAt: new Date().toISOString(),
      traceId: resolveTraceId(currentTraceId()),
      familyId: owner.familyId ?? null,
      sourceVersion: owner.sourceVersion ?? 1,
      payload,
    },
    owner.userId ? { userId: owner.userId } : {},
  );
