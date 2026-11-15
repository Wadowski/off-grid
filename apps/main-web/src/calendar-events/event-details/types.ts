// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { calendarEventSchema } from "@offgrid/contracts";

export type CalendarEventDetails = ReturnType<typeof calendarEventSchema.parse>;

export type CalendarEventStatus = "loading" | "ready" | "notFound" | "failed";

export type CalendarEventState = {
  readonly status: CalendarEventStatus;
  readonly event: CalendarEventDetails | undefined;
  readonly retry: () => void;
};

export type EventDetailsShellProps = {
  readonly event: CalendarEventDetails | undefined;
  readonly status: CalendarEventStatus;
  readonly retry: () => void;
  readonly timeZone: string;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
};
