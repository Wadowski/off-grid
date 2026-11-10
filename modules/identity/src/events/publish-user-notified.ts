// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { userNotifiedV1 } from "@offgrid/contracts";
import { publish } from "@offgrid/event-bus";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { currentTraceId, resolveTraceId } from "@offgrid/observability";
import type { UserNotice } from "../types.js";

export const publishUserNotified = async (
  tx: ModuleTransaction,
  notification: UserNotice,
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
      payload: {
        notificationId: notification.id,
        userId: notification.userId,
        type: notification.type,
        data: {},
      },
    },
    { userId: notification.userId },
  );
};
