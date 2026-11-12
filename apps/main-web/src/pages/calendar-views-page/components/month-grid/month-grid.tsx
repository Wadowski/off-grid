// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../../../calendars/calendar-accents.js";
import { distinctCalendarColors } from "../../../../calendar-views/events-by-calendar.js";
import { addDays, mondayIndexOf } from "../../../../calendar-views/week-days.js";
import { SelectedDaySheet } from "./components/selected-day-sheet/selected-day-sheet.js";
import {
  monthDayCellStyle,
  monthSectionStyle,
  monthDayNumberStyle,
  monthDaysGridStyle,
  monthDotRowStyle,
  monthDotStyle,
  monthGridCardStyle,
  monthWeekdayRowStyle,
} from "./styles.js";
import type { MonthGridProps } from "./types.js";
import type { CalendarViewEvent } from "../../../../calendar-views/use-calendar-view.js";

const MAX_DOTS = 3;

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
            <span key={index}>{letter}</span>
          ))}
        </div>
        <div style={monthDaysGridStyle}>
          {cells.map((cell) => {
            const events: readonly CalendarViewEvent[] = eventsByDate.get(cell.date) ?? [];
            const selected = cell.date === selectedDate;
            const dots = distinctCalendarColors(events, MAX_DOTS);
            const content = (
              <>
                <span style={monthDayNumberStyle(selected)}>{Number(cell.date.slice(8))}</span>
                <span style={monthDotRowStyle}>
                  {dots.map((color) => (
                    <span
                      key={color}
                      style={monthDotStyle(calendarAccentColor(color).background)}
                    />
                  ))}
                </span>
              </>
            );
            if (!cell.inMonth) {
              return (
                <span key={cell.date} style={monthDayCellStyle(false)}>
                  {content}
                </span>
              );
            }
            return (
              <button
                key={cell.date}
                type="button"
                className="og-focusable"
                aria-current={cell.date === todayDate ? "date" : undefined}
                aria-pressed={selected}
                data-testid={`month-day-${cell.date}`}
                style={monthDayCellStyle(true)}
                onClick={() => onSelect(cell.date)}
              >
                {content}
              </button>
            );
          })}
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
