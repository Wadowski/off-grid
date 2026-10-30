// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { FamilyCreatedInput } from "../types.js";
import { publish } from "@offgrid/event-bus";
import { familyCreatedV1 } from "@offgrid/contracts";
import { randomUUID } from "node:crypto";
import { currentTraceId, resolveTraceId } from "@offgrid/observability";

export const publishFamilyCreated = async (
  client: ClientBase,
  input: FamilyCreatedInput,
): Promise<void> => {
  await publish(client, familyCreatedV1, {
    id: randomUUID(),
    type: familyCreatedV1.name,
    version: familyCreatedV1.version,
    occurredAt: new Date().toISOString(),
    traceId: resolveTraceId(currentTraceId()),
    familyId: input.familyId,
    sourceVersion: 1,
    payload: { name: input.name, creatorUserId: input.creatorUserId },
  });
};
