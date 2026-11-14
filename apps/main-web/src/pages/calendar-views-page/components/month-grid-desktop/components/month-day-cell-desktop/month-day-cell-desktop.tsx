// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { formatDayHeading } from "../../../../../../calendar-views/time-format.js";
import { weekDayNumber } from "../../../../../../calendar-views/week-days.js";
import { MonthEventChip } from "../month-event-chip/month-event-chip.js";
import {
  desktopMonthCellStyle,
  desktopMonthChipListStyle,
  desktopMonthDayNumberStyle,
  desktopMonthMoreTextStyle,
} from "../../styles.js";
import type { MonthDayCellDesktopProps } from "./types.js";

const MAX_CHIPS_PER_DAY = 2;

export const MonthDayCellDesktop = ({
  date,
  inMonth,
  events,
  selected,
  today,
  timeZone,
  onOpenDay,
}: MonthDayCellDesktopProps) => {
  const visible = events.slice(0, MAX_CHIPS_PER_DAY);
  const hidden = events.length - visible.length;

  return (
    <div
      role="group"
      aria-label={formatDayHeading(date)}
      data-testid={`month-desktop-cell-${date}`}
      style={desktopMonthCellStyle(inMonth, today, selected)}
    >
      {inMonth ? (
        <Button
          variant="ghost"
          size="small"
          align="start"
          aria-current={today ? "date" : undefined}
          data-selected={selected}
          data-testid={`month-desktop-day-${date}`}
          onClick={() => onOpenDay(date)}
        >
          <span style={desktopMonthDayNumberStyle(selected, today)}>{weekDayNumber(date)}</span>
        </Button>
      ) : (
        <span style={desktopMonthDayNumberStyle(false, false)}>{weekDayNumber(date)}</span>
      )}
      {inMonth && (
        <div style={desktopMonthChipListStyle}>
          {visible.map((event) => (
            <MonthEventChip key={event.id} event={event} timeZone={timeZone} />
          ))}
          {hidden > 0 && (
            <Button
              variant="ghost"
              size="small"
              align="start"
              fullWidth
              onClick={() => onOpenDay(date)}
            >
              <Text
                variant="caption"
                textId="calendar.desktop.moreEvents"
                values={{ count: hidden }}
                style={desktopMonthMoreTextStyle}
              />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
