// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { weekDayLabel, weekDayNumber } from "../../../../calendar-views/week-days.js";
import {
  weekStripDayStyle,
  weekStripNumberStyle,
  weekStripStyle,
  weekStripTodayDotStyle,
  weekStripWeekdayStyle,
} from "./styles.js";
import type { WeekStripProps } from "./types.js";

export const WeekStrip = ({ dates, selectedDate, todayDate, onSelect }: WeekStripProps) => {
  const { t } = useTranslation();
  const labels = useMemo(
    () => dates.map((date) => ({ date, weekday: weekDayLabel(date), day: weekDayNumber(date) })),
    [dates],
  );

  return (
    <div role="group" aria-label={t("calendar.mobileViews.weekGridLabel")} style={weekStripStyle}>
      {labels.map(({ date, weekday, day }) => {
        const selected = date === selectedDate;
        return (
          <button
            key={date}
            type="button"
            className="og-focusable"
            aria-current={selected ? "date" : undefined}
            aria-label={`${weekday} ${day}`}
            data-testid={`week-strip-${date}`}
            style={weekStripDayStyle(selected)}
            onClick={() => onSelect(date)}
          >
            <span style={weekStripWeekdayStyle}>{weekday}</span>
            <span style={weekStripNumberStyle}>{day}</span>
            {date === todayDate ? <span style={weekStripTodayDotStyle(selected)} /> : null}
          </button>
        );
      })}
    </div>
  );
};
