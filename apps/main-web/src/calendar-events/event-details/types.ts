// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarEventDetails, CalendarEventStatus } from "./use-calendar-event.js";

export type EventDetailsShellProps = {
  readonly event: CalendarEventDetails | undefined;
  readonly status: CalendarEventStatus;
  readonly retry: () => void;
  readonly timeZone: string;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
};

export type EventDetailsModalProps = EventDetailsShellProps & {
  readonly onClose: () => void;
};

export type EventDetailsPageProps = EventDetailsShellProps & {
  readonly onBack: () => void;
};
