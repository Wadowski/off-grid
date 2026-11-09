// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { AnyEventDefinition } from "@offgrid/contracts";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { publish } from "@offgrid/event-bus";
import { currentTraceId, resolveTraceId } from "@offgrid/observability";

export const publishFamilyEvent = (
  tx: ModuleTransaction,
  definition: AnyEventDefinition,
  familyId: string,
  payload: unknown,
): Promise<number> =>
  publish(rawSqlExecutor(tx), definition, {
    id: randomUUID(),
    type: definition.name,
    version: definition.version,
    occurredAt: new Date().toISOString(),
    traceId: resolveTraceId(currentTraceId()),
    familyId,
    sourceVersion: 1,
    payload,
  });
