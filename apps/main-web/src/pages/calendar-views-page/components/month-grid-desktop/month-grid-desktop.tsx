// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { monthCells } from "../../../../calendar-views/month-cells.js";
import { MonthDayCellDesktop } from "./components/month-day-cell-desktop/month-day-cell-desktop.js";
import {
  desktopMonthCardStyle,
  desktopMonthDaysGridStyle,
  desktopMonthScrollStyle,
  desktopMonthWeekdayCellStyle,
  desktopMonthWeekdayRowStyle,
} from "./styles.js";
import type { MonthGridDesktopProps } from "./types.js";

// The desktop header shows three-letter names. The mobile single letters in weekday-letters.ts do
// not fit this design.
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
  const eventsByDate = new Map(days.map((day) => [day.date, day.events]));

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
      <div style={desktopMonthScrollStyle}>
        <div style={desktopMonthDaysGridStyle}>
          {cells.map((cell) => (
            <MonthDayCellDesktop
              key={cell.date}
              date={cell.date}
              inMonth={cell.inMonth}
              events={eventsByDate.get(cell.date) ?? []}
              selected={cell.date === selectedDate}
              today={cell.date === todayDate}
              timeZone={timeZone}
              onOpenDay={onOpenDay}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
