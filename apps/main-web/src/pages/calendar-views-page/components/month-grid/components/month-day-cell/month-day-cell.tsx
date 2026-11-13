// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button } from "@offgrid/ui";
import { calendarAccentColor } from "../../../../../../calendars/calendar-accents.js";
import { distinctCalendarColors } from "../../../../../../calendar-views/events-by-calendar.js";
import {
  monthDayCellStyle,
  monthDayNumberStyle,
  monthDotRowStyle,
  monthDotStyle,
} from "../../styles.js";
import type { MonthDayCellProps } from "./types.js";

const MAX_DOTS = 3;

export const MonthDayCell = ({
  date,
  inMonth,
  events,
  selected,
  today,
  onSelect,
}: MonthDayCellProps) => {
  const dots = distinctCalendarColors(events, MAX_DOTS);
  const content = (
    <span style={monthDayCellStyle(inMonth)}>
      <span style={monthDayNumberStyle(selected)}>{Number(date.slice(8))}</span>
      <span style={monthDotRowStyle}>
        {dots.map((color) => (
          <span
            key={color}
            data-testid="month-day-dot"
            style={monthDotStyle(calendarAccentColor(color).background)}
          />
        ))}
      </span>
    </span>
  );

  if (!inMonth) {
    return content;
  }

  return (
    <Button
      variant="ghost"
      fullWidth
      aria-current={today ? "date" : undefined}
      aria-pressed={selected}
      data-testid={`month-day-${date}`}
      onClick={() => onSelect(date)}
    >
      {content}
    </Button>
  );
};
