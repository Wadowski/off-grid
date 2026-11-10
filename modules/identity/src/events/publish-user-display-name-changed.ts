// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { userDisplayNameChangedV1 } from "@offgrid/contracts";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { publish } from "@offgrid/event-bus";
import { currentTraceId, resolveTraceId } from "@offgrid/observability";

export const publishUserDisplayNameChanged = async (
  tx: ModuleTransaction,
  userId: string,
  displayName: string,
  sourceVersion: number,
): Promise<void> => {
  await publish(
    rawSqlExecutor(tx),
    userDisplayNameChangedV1,
    {
      id: randomUUID(),
      type: userDisplayNameChangedV1.name,
      version: userDisplayNameChangedV1.version,
      occurredAt: new Date().toISOString(),
      traceId: resolveTraceId(currentTraceId()),
      familyId: null,
      sourceVersion,
      payload: { userId, displayName },
    },
    { userId },
  );
};
