// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../../../../../calendars/calendar-accents.js";
import { formatClockTime } from "../../../../../../calendar-views/time-format.js";
import { monthEventChipStyle } from "./styles.js";
import type { MonthEventChipProps } from "./types.js";

// A chip is read-only: it has no action and so no tab stop. Its name (title and time) is exposed as
// an image name, because a span with aria-label has no role and exposes no name. The day's
// number and "+N more events" control are the keyboard entries into the month.
export const MonthEventChip = ({ event, timeZone }: MonthEventChipProps) => {
  const { t } = useTranslation();
  const accent = calendarAccentColor(event.calendarColor).background;
  const time = event.isAllDay
    ? t("calendar.mobileViews.allDay")
    : formatClockTime(event.startsAt, timeZone);

  return (
    <span
      role="img"
      aria-label={t("calendar.desktop.eventChipLabel", { title: event.title, time })}
      data-testid={`month-event-chip-${event.id}`}
      style={monthEventChipStyle(accent)}
    >
      {event.title}
    </span>
  );
};
