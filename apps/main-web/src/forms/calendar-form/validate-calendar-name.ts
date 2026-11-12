// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { nameSchema } from "@offgrid/contracts";

export type CalendarNameErrorTextId = "calendar.errors.nameRequired";

export const validateCalendarName = (trimmedName: string): CalendarNameErrorTextId | undefined =>
  nameSchema.safeParse(trimmedName.trim()).success ? undefined : "calendar.errors.nameRequired";
