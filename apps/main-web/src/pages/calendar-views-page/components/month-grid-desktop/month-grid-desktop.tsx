// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { monthCells } from "../../../../calendar-views/month-cells.js";
import { formatDayHeading } from "../../../../calendar-views/time-format.js";
import { MonthEventChip } from "./components/month-event-chip/month-event-chip.js";
import {
  desktopMonthCardStyle,
  desktopMonthCellStyle,
  desktopMonthChipListStyle,
  desktopMonthDayNumberStyle,
  desktopMonthDaysGridStyle,
  desktopMonthMoreStyle,
  desktopMonthWeekdayCellStyle,
  desktopMonthWeekdayRowStyle,
} from "./styles.js";
import type { MonthGridDesktopProps } from "./types.js";

// The design shows up to two chips in a day cell. Any further events are summarised by a
// "+N more events" control that opens the day.
const MAX_CHIPS_PER_DAY = 2;

const WEEKDAY_SHORT_KEYS = [
  "calendar.desktop.weekdayShortMonday",
  "calendar.desktop.weekdayShortTuesday",
  "calendar.desktop.weekdayShortWednesday",
  "calendar.desktop.weekdayShortThursday",
  "calendar.desktop.weekdayShortFriday",
  "calendar.desktop.weekdayShortSaturday",
  "calendar.desktop.weekdayShortSunday",
] as const;

export const MonthGridDesktop = ({
  days,
  selectedDate,
  todayDate,
  timeZone,
  onOpenDay,
}: MonthGridDesktopProps) => {
  const { t } = useTranslation();
  const cells = monthCells(days.map((day) => day.date));
  // The calendar views API already lists a multi-day event on each day it covers.
  const eventsOnDay = new Map(days.map((day) => [day.date, day.events]));

  return (
    <div
      style={desktopMonthCardStyle}
      role="region"
      aria-label={t("calendar.desktop.monthGridLabel")}
    >
      <div style={desktopMonthWeekdayRowStyle} aria-hidden="true">
        {WEEKDAY_SHORT_KEYS.map((key) => (
          <span key={key} style={desktopMonthWeekdayCellStyle}>
            {t(key)}
          </span>
        ))}
      </div>
      <div style={desktopMonthDaysGridStyle}>
        {cells.map((cell) => {
          const events = eventsOnDay.get(cell.date) ?? [];
          const visible = events.slice(0, MAX_CHIPS_PER_DAY);
          const hidden = events.length - visible.length;
          const selected = cell.date === selectedDate;
          const today = cell.date === todayDate;
          const dayNumber = Number(cell.date.slice(8));

          return (
            <div
              key={cell.date}
              role="group"
              aria-label={formatDayHeading(cell.date)}
              data-testid={`month-desktop-cell-${cell.date}`}
              style={desktopMonthCellStyle(cell.inMonth)}
            >
              {cell.inMonth ? (
                <button
                  type="button"
                  aria-current={today ? "date" : undefined}
                  data-selected={selected}
                  data-testid={`month-desktop-day-${cell.date}`}
                  style={desktopMonthDayNumberStyle(selected, today)}
                  onClick={() => onOpenDay(cell.date)}
                >
                  {dayNumber}
                </button>
              ) : (
                <span style={desktopMonthDayNumberStyle(false, false)}>{dayNumber}</span>
              )}
              {cell.inMonth && (
                <div style={desktopMonthChipListStyle}>
                  {visible.map((event) => (
                    <MonthEventChip key={event.id} event={event} timeZone={timeZone} />
                  ))}
                  {hidden > 0 && (
                    <button
                      type="button"
                      style={desktopMonthMoreStyle}
                      onClick={() => onOpenDay(cell.date)}
                    >
                      {t("calendar.desktop.moreEvents", { count: hidden })}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
