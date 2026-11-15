// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEventOpenProps } from "../../../../../../calendar-events/use-event-open-props.js";
import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../../../../../calendars/calendar-accents.js";
import { formatClockTime } from "../../../../../../calendar-views/time-format.js";
import { monthEventChipButtonStyle, monthEventChipStyle } from "./styles.js";
import type { MonthEventChipProps } from "./types.js";

export const MonthEventChip = ({ event, timeZone }: MonthEventChipProps) => {
  const { t } = useTranslation();
  const open = useEventOpenProps(event.id);
  const accent = calendarAccentColor(event.calendarColor).background;
  const time = event.isAllDay
    ? t("calendar.mobileViews.allDay")
    : formatClockTime(event.startsAt, timeZone);

  const label = t("calendar.desktop.eventChipLabel", { title: event.title, time });
  const chip = (
    <span role="img" aria-label={label} style={monthEventChipStyle(accent)}>
      {event.title}
    </span>
  );
  if (open.onClick === undefined) {
    return <span data-testid={`month-event-chip-${event.id}`}>{chip}</span>;
  }
  return (
    <button
      type="button"
      data-testid={`month-event-chip-${event.id}`}
      style={monthEventChipButtonStyle}
      onClick={open.onClick}
    >
      {chip}
    </button>
  );
};
