// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyCreatedV1 } from "@offgrid/contracts";
import type { ModuleDatabase } from "@offgrid/db";
import { requireEventFamilyId } from "@offgrid/event-bus";
import { createFamilyCalendar } from "../../application/calendars/create-family-calendar.js";

export const familyCalendarSubscription = (db: ModuleDatabase) => ({
  name: "calendar-family-calendar-from-family-created",
  event: familyCreatedV1,
  runAs: "calendar",
  handler: (event: {
    readonly familyId: string | null;
    readonly payload: { readonly name: string };
  }) =>
    db.$transaction((tx) =>
      createFamilyCalendar(tx, requireEventFamilyId(event.familyId), event.payload.name),
    ),
});
