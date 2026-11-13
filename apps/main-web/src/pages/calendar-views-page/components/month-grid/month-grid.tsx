// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { addDays, mondayIndexOf } from "../../../../calendar-views/week-days.js";
import { MonthDayCell } from "./components/month-day-cell/month-day-cell.js";
import { SelectedDaySheet } from "./components/selected-day-sheet/selected-day-sheet.js";
import {
  monthDaysGridStyle,
  monthGridCardStyle,
  monthSectionStyle,
  monthWeekdayRowStyle,
} from "./styles.js";
import type { MonthGridProps } from "./types.js";

export const MonthGrid = ({
  days,
  selectedDate,
  todayDate,
  timeZone,
  selectedEvents,
  onSelect,
}: MonthGridProps) => {
  const { t } = useTranslation();
  const dayLetters = [
    t("calendar.mobileViews.weekdayMonday"),
    t("calendar.mobileViews.weekdayTuesday"),
    t("calendar.mobileViews.weekdayWednesday"),
    t("calendar.mobileViews.weekdayThursday"),
    t("calendar.mobileViews.weekdayFriday"),
    t("calendar.mobileViews.weekdaySaturday"),
    t("calendar.mobileViews.weekdaySunday"),
  ];
  const cells = monthCells(days.map((day) => day.date));
  const eventsByDate = new Map(days.map((day) => [day.date, day.events]));

  return (
    <section style={monthSectionStyle}>
      <div
        style={monthGridCardStyle}
        role="group"
        aria-label={t("calendar.mobileViews.monthGridLabel")}
      >
        <div style={monthWeekdayRowStyle} aria-hidden="true">
          {dayLetters.map((letter, index) => (
            <Text key={index} variant="caption" value={letter} />
          ))}
        </div>
        <div style={monthDaysGridStyle}>
          {cells.map((cell) => (
            <MonthDayCell
              key={cell.date}
              date={cell.date}
              inMonth={cell.inMonth}
              events={eventsByDate.get(cell.date) ?? []}
              selected={cell.date === selectedDate}
              today={cell.date === todayDate}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
      <SelectedDaySheet date={selectedDate} events={selectedEvents} timeZone={timeZone} />
    </section>
  );
};

type MonthCell = { readonly date: string; readonly inMonth: boolean };

const monthCells = (monthDates: readonly string[]): MonthCell[] => {
  const first = monthDates[0];
  const last = monthDates[monthDates.length - 1];
  if (first === undefined || last === undefined) {
    return [];
  }
  const leading = mondayIndexOf(first);
  const used = leading + monthDates.length;
  const trailing = (7 - (used % 7)) % 7;
  const before = Array.from({ length: leading }, (_, index) => ({
    date: addDays(first, index - leading),
    inMonth: false,
  }));
  const inMonth = monthDates.map((date) => ({ date, inMonth: true }));
  const after = Array.from({ length: trailing }, (_, index) => ({
    date: addDays(last, index + 1),
    inMonth: false,
  }));
  return [...before, ...inMonth, ...after];
};
