// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../../../../../calendars/calendar-accents.js";
import { formatClockTime } from "../../../../../../calendar-views/time-format.js";
import { monthEventChipStyle } from "./styles.js";
import type { MonthEventChipProps } from "./types.js";

// A chip is focusable and named by its title and time. Clicking it does nothing: event details
// open from the agenda and the event modal, not from the month grid.
export const MonthEventChip = ({ event, timeZone }: MonthEventChipProps) => {
  const { t } = useTranslation();
  const accent = calendarAccentColor(event.calendarColor).background;
  const time = event.isAllDay
    ? t("calendar.mobileViews.allDay")
    : formatClockTime(event.startsAt, timeZone);

  return (
    <span
      tabIndex={0}
      aria-label={t("calendar.desktop.eventChipLabel", { title: event.title, time })}
      data-testid={`month-event-chip-${event.id}`}
      style={monthEventChipStyle(accent)}
    >
      {event.title}
    </span>
  );
};
