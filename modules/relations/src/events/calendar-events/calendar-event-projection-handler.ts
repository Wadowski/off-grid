// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { EventOf } from "@offgrid/event-bus";
import {
  calendarEventCreatedV1,
  calendarEventRemovedV1,
  calendarEventUpdatedV1,
} from "@offgrid/contracts";
import { setOwnerContext } from "../../infrastructure/linkable-entities/set-owner-context.js";
import { requireOwner } from "../require-owner.js";
import { applyCalendarEventRemoval } from "./apply-calendar-event-removal.js";
import { applyCalendarEventUpsert } from "./apply-calendar-event-upsert.js";

export const calendarEventProjectionHandler = (
  db: ModuleDatabase,
  event:
    | EventOf<typeof calendarEventCreatedV1>
    | EventOf<typeof calendarEventUpdatedV1>
    | EventOf<typeof calendarEventRemovedV1>,
): Promise<void> =>
  db.$transaction(async (tx) => {
    const owner = requireOwner(event);
    await setOwnerContext(tx, owner);
    const endpoint = { entityType: "calendar-event" as const, entityId: event.payload.eventId };
    if (event.type === calendarEventRemovedV1.name) {
      return applyCalendarEventRemoval(tx, { endpoint, sourceVersion: event.sourceVersion });
    }
    return applyCalendarEventUpsert(tx, {
      endpoint,
      owner,
      title: event.payload.title,
      sourceVersion: event.sourceVersion,
    });
  });
