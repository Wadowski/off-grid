// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";

export type CalendarErrorTextId =
  "calendar.errors.notFound" | "calendar.errors.defaultCalendar" | "calendar.errors.failed";

export const toCalendarErrorTextId = (error: unknown): CalendarErrorTextId => {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "calendar.errors.notFound";
    }
    if (error.status === 409 && error.code === "DEFAULT_CALENDAR") {
      return "calendar.errors.defaultCalendar";
    }
  }
  return "calendar.errors.failed";
};
