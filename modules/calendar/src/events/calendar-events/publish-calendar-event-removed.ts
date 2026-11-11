// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { calendarEventRemovedV1 } from "@offgrid/contracts";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { publish } from "@offgrid/event-bus";
import { currentTraceId, resolveTraceId } from "@offgrid/observability";

// A personal calendar names its owner in the event; a family calendar names the family.
export const publishCalendarEventRemoved = (
  tx: ModuleTransaction,
  owner: { readonly familyId: string | null; readonly userId: string | null },
  payload: { readonly eventId: string; readonly calendarId: string },
): Promise<number> =>
  publish(
    rawSqlExecutor(tx),
    calendarEventRemovedV1,
    {
      id: randomUUID(),
      type: calendarEventRemovedV1.name,
      version: calendarEventRemovedV1.version,
      occurredAt: new Date().toISOString(),
      traceId: resolveTraceId(currentTraceId()),
      familyId: owner.familyId,
      sourceVersion: 1,
      payload,
    },
    owner.userId === null ? {} : { userId: owner.userId },
  );
