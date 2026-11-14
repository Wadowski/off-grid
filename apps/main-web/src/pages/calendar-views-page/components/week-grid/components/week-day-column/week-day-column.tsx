// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarAccentColor } from "../../../../../../calendars/calendar-accents.js";
import { splitAllDay } from "../../../../../../calendar-views/events-by-calendar.js";
import { formatClockRange, formatClockTime } from "../../../../../../calendar-views/time-format.js";
import {
  layoutTimedEvents,
  nowMinutesOnDate,
} from "../../../../../../calendar-views/timeline-layout.js";
import { WEEK_MIN_BLOCK_PX } from "../../constants.js";
import {
  weekBlockStyle,
  weekBlockTimeStyle,
  weekBlockTitleStyle,
  weekColumnStyle,
  weekDetailedBlockStyle,
  weekDetailedRangeStyle,
  weekDetailedTitleStyle,
  weekLocationChipStyle,
  weekNowDotStyle,
  weekNowLineStyle,
  weekNowStyle,
} from "../../styles.js";
import type { WeekDayColumnProps } from "./types.js";

const MINUTES_PER_HOUR = 60;

export const WeekDayColumn = ({
  date,
  events,
  startHour,
  timeZone,
  now,
  hourPx,
  card,
}: WeekDayColumnProps) => {
  const pxPerMinute = hourPx / MINUTES_PER_HOUR;
  const nowMinute = nowMinutesOnDate(now, date, timeZone);
  const blocks = layoutTimedEvents(splitAllDay(events).timed, date, timeZone);

  return (
    <div data-testid="week-day-column" style={weekColumnStyle}>
      {blocks.map((block) => {
        const top = (block.topMinutes - startHour * 60) * pxPerMinute;
        const height = Math.max(block.heightMinutes * pxPerMinute, WEEK_MIN_BLOCK_PX);
        const accent = calendarAccentColor(block.item.calendarColor);
        if (card === "detailed") {
          return (
            <div
              key={block.item.id}
              data-testid={`week-event-${block.item.id}`}
              style={weekDetailedBlockStyle(top, height, block.column, block.columnCount, accent)}
            >
              <div style={weekDetailedTitleStyle}>{block.item.title}</div>
              <div style={weekDetailedRangeStyle}>
                {formatClockRange(block.item.startsAt, block.item.endsAt, timeZone)}
              </div>
              {block.item.location !== null && block.item.location !== "" && (
                <span style={weekLocationChipStyle(accent)} data-testid="week-event-location">
                  {block.item.location}
                </span>
              )}
            </div>
          );
        }
        return (
          <div
            key={block.item.id}
            data-testid={`week-event-${block.item.id}`}
            style={weekBlockStyle(top, height, block.column, block.columnCount, accent.background)}
          >
            <div style={weekBlockTitleStyle}>{block.item.title}</div>
            <div style={weekBlockTimeStyle}>{formatClockTime(block.item.startsAt, timeZone)}</div>
          </div>
        );
      })}
      {nowMinute !== null && (
        <div
          data-testid="week-now"
          style={weekNowStyle((nowMinute - startHour * 60) * pxPerMinute)}
        >
          <span style={weekNowDotStyle} />
          <span style={weekNowLineStyle} />
        </div>
      )}
    </div>
  );
};
