// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { userCreatedV1 } from "@offgrid/contracts";
import { publish } from "@offgrid/event-bus";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { currentTraceId, resolveTraceId } from "@offgrid/observability";
import type { UserCreatedInput } from "../types.js";

export const publishUserCreated = async (
  tx: ModuleTransaction,
  input: UserCreatedInput,
): Promise<void> => {
  await publish(
    rawSqlExecutor(tx),
    userCreatedV1,
    {
      id: randomUUID(),
      type: userCreatedV1.name,
      version: userCreatedV1.version,
      occurredAt: new Date().toISOString(),
      traceId: resolveTraceId(currentTraceId()),
      familyId: null,
      sourceVersion: 1,
      payload: { userId: input.userId, displayName: input.displayName },
    },
    { userId: input.userId },
  );
};
