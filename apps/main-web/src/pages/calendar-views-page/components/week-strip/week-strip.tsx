// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button } from "@offgrid/ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { weekDayLabel, weekDayNumber } from "../../../../calendar-views/week-days.js";
import {
  weekStripDayContentStyle,
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
          <Button
            key={date}
            variant={selected ? "primary" : "ghost"}
            fullWidth
            aria-current={selected ? "date" : undefined}
            data-testid={`week-strip-${date}`}
            onClick={() => onSelect(date)}
          >
            <span style={weekStripDayContentStyle(selected)}>
              <span style={weekStripWeekdayStyle}>{weekday}</span>{" "}
              <span style={weekStripNumberStyle}>{day}</span>
              {date === todayDate ? <span style={weekStripTodayDotStyle(selected)} /> : null}
            </span>
          </Button>
        );
      })}
    </div>
  );
};
