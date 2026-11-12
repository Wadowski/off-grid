// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventRemovedV1 } from "@offgrid/contracts";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { publishOwnedEvent } from "@offgrid/event-bus";

export const publishCalendarEventRemoved = (
  tx: ModuleTransaction,
  owner: {
    readonly familyId: string | null;
    readonly userId: string | null;
    readonly sourceVersion: number;
  },
  payload: { readonly eventId: string; readonly calendarId: string },
): Promise<number> => publishOwnedEvent(rawSqlExecutor(tx), calendarEventRemovedV1, owner, payload);
