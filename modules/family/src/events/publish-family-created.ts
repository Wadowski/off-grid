// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { familyCreatedV1 } from "@offgrid/contracts";
import { publish } from "@offgrid/event-bus";
import { currentTraceId, resolveTraceId } from "@offgrid/observability";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import type { FamilyCreatedInput } from "../types.js";

export const publishFamilyCreated = async (
  tx: ModuleTransaction,
  input: FamilyCreatedInput,
): Promise<void> => {
  await publish(rawSqlExecutor(tx), familyCreatedV1, {
    id: randomUUID(),
    type: familyCreatedV1.name,
    version: familyCreatedV1.version,
    occurredAt: new Date().toISOString(),
    traceId: resolveTraceId(currentTraceId()),
    familyId: input.familyId,
    sourceVersion: 1,
    payload: { name: input.name },
  });
};
