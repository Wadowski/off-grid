// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text, VisuallyHidden } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import {
  addDays,
  addMonths,
  daysBetween,
  isoWeekNumber,
  mondayOf,
  weekDates,
  weekDayNumber,
} from "../../../../../../calendar-views/week-days.js";
import { periodLabel } from "../../../../../../calendar-views/view-navigation.js";
import type { CalendarMiniMonthProps } from "./types.js";
import {
  miniMonthDayStyle,
  miniMonthGridStyle,
  miniMonthStyle,
  miniMonthWeekdayStyle,
  miniMonthWeekNumberStyle,
} from "./styles.js";

const WEEKDAY_KEYS = [
  "calendar.mobileViews.weekdayMonday",
  "calendar.mobileViews.weekdayTuesday",
  "calendar.mobileViews.weekdayWednesday",
  "calendar.mobileViews.weekdayThursday",
  "calendar.mobileViews.weekdayFriday",
  "calendar.mobileViews.weekdaySaturday",
  "calendar.mobileViews.weekdaySunday",
] as const;

const FULL_DATE = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

// A small month for the calendar sidebar: week numbers, the days of the shown month, and the selected day.
export const CalendarMiniMonth = ({
  selectedDate,
  todayDate,
  onSelect,
}: CalendarMiniMonthProps) => {
  const { t } = useTranslation();
  const monthPrefix = selectedDate.slice(0, 7);
  const firstOfMonth = `${monthPrefix}-01`;
  const daysInMonth = daysBetween(firstOfMonth, addMonths(firstOfMonth, 1));
  const firstMonday = mondayOf(firstOfMonth);
  const weekCount = Math.ceil((daysBetween(firstMonday, firstOfMonth) + daysInMonth) / 7);
  const weeks = Array.from({ length: weekCount }, (_, index) => addDays(firstMonday, index * 7));

  return (
    <section
      aria-label={t("calendar.desktop.miniMonthLabel")}
      style={miniMonthStyle}
      data-testid="calendar-mini-month"
    >
      <Text variant="label" value={periodLabel("month", firstOfMonth)} />
      <div style={miniMonthGridStyle}>
        <span aria-hidden="true" />
        {WEEKDAY_KEYS.map((key) => (
          <span key={key} style={miniMonthWeekdayStyle}>
            {t(key)}
          </span>
        ))}
        {weeks.map((monday) => {
          const weekNumber = isoWeekNumber(monday);
          return (
            <MiniMonthWeek
              key={monday}
              weekNumber={weekNumber}
              dates={weekDates(monday)}
              monthPrefix={monthPrefix}
              selectedDate={selectedDate}
              todayDate={todayDate}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </section>
  );
};

type MiniMonthWeekProps = {
  readonly weekNumber: number;
  readonly dates: readonly string[];
  readonly monthPrefix: string;
  readonly selectedDate: string;
  readonly todayDate: string;
  readonly onSelect: (date: string) => void;
};

const MiniMonthWeek = ({
  weekNumber,
  dates,
  monthPrefix,
  selectedDate,
  todayDate,
  onSelect,
}: MiniMonthWeekProps) => {
  const { t } = useTranslation();
  return (
    <>
      <span style={miniMonthWeekNumberStyle}>
        <VisuallyHidden>{t("calendar.desktop.weekNumber", { number: weekNumber })}</VisuallyHidden>
        <span aria-hidden="true">{weekNumber}</span>
      </span>
      {dates.map((date) => {
        const selected = date === selectedDate;
        const inMonth = date.startsWith(monthPrefix);
        return (
          <span key={date} style={miniMonthDayStyle(inMonth, date === todayDate)}>
            <Button
              fullWidth
              size="small"
              variant={selected ? "primary" : "ghost"}
              aria-current={selected ? "date" : undefined}
              aria-label={FULL_DATE.format(new Date(`${date}T00:00:00Z`))}
              data-testid={`mini-month-day-${date}`}
              onClick={() => onSelect(date)}
            >
              {weekDayNumber(date)}
            </Button>
          </span>
        );
      })}
    </>
  );
};
