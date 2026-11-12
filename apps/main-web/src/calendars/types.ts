// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  calendarSchema,
  createCalendarRequestSchema,
  updateCalendarRequestSchema,
} from "@offgrid/contracts";

export type Calendar = ReturnType<typeof calendarSchema.parse>;
export type CreateCalendarInput = ReturnType<typeof createCalendarRequestSchema.parse>;
export type UpdateCalendarInput = ReturnType<typeof updateCalendarRequestSchema.parse>;

export type CalendarSaveStatus = "idle" | "submitting" | "failed";
