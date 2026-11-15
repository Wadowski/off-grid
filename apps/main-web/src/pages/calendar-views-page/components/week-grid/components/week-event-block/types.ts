// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { calendarAccentColor } from "../../../../../../calendars/calendar-accents.js";
import type { PositionedBlock } from "../../../../../../calendar-views/timeline-layout.js";
import type { CalendarViewEvent } from "../../../../../../calendar-views/use-calendar-view.js";
import type { WeekCardStyle } from "../../constants.js";

export type WeekAccent = ReturnType<typeof calendarAccentColor>;

export type WeekEventBlockProps = {
  readonly block: PositionedBlock<CalendarViewEvent>;
  readonly startHour: number;
  readonly pxPerMinute: number;
  readonly timeZone: string;
  readonly card: WeekCardStyle;
};

export type WeekEventCardProps = {
  readonly event: CalendarViewEvent;
  readonly top: number;
  readonly height: number;
  readonly column: number;
  readonly columnCount: number;
  readonly accent: WeekAccent;
  readonly timeZone: string;
};
