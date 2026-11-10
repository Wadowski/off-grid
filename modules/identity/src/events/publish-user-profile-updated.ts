// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { userProfileUpdatedV1 } from "@offgrid/contracts";
import { publish } from "@offgrid/event-bus";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { currentTraceId, resolveTraceId } from "@offgrid/observability";
import type { UserProfileUpdatedInput } from "../types.js";

export const publishUserProfileUpdated = async (
  tx: ModuleTransaction,
  input: UserProfileUpdatedInput,
): Promise<void> => {
  await publish(
    rawSqlExecutor(tx),
    userProfileUpdatedV1,
    {
      id: randomUUID(),
      type: userProfileUpdatedV1.name,
      version: userProfileUpdatedV1.version,
      occurredAt: new Date().toISOString(),
      traceId: resolveTraceId(currentTraceId()),
      familyId: null,
      sourceVersion: input.sourceVersion,
      payload: { userId: input.userId, displayName: input.displayName },
    },
    { userId: input.userId },
  );
};
