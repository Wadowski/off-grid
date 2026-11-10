// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { userNotifiedV1 } from "@offgrid/contracts";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { publish } from "@offgrid/event-bus";
import { currentTraceId, resolveTraceId } from "@offgrid/observability";

export const publishUserNotified = async (
  tx: ModuleTransaction,
  notice: { readonly notificationId: string; readonly userId: string; readonly type: string },
  occurredAt: Date,
): Promise<void> => {
  await publish(
    rawSqlExecutor(tx),
    userNotifiedV1,
    {
      id: randomUUID(),
      type: userNotifiedV1.name,
      version: userNotifiedV1.version,
      occurredAt: occurredAt.toISOString(),
      traceId: resolveTraceId(currentTraceId()),
      familyId: null,
      sourceVersion: 1,
      payload: { ...notice, data: {} },
    },
    { userId: notice.userId },
  );
};
