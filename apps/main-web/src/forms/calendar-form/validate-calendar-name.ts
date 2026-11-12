// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type CalendarNameErrorTextId = "calendar.errors.nameRequired";

export const validateCalendarName = (trimmedName: string): CalendarNameErrorTextId | undefined =>
  trimmedName.length === 0 ? "calendar.errors.nameRequired" : undefined;
