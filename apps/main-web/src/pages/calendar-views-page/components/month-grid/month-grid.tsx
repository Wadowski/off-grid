// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { monthCells } from "../../../../calendar-views/month-cells.js";
import { weekdayLetters } from "../../../../calendar-views/weekday-letters.js";
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
  const dayLetters = weekdayLetters(t);
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
