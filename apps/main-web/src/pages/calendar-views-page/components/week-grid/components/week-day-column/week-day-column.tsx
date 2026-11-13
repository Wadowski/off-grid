// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarAccentColor } from "../../../../../../calendars/calendar-accents.js";
import { splitAllDay } from "../../../../../../calendar-views/events-by-calendar.js";
import { formatClockTime } from "../../../../../../calendar-views/time-format.js";
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
  weekNowDotStyle,
  weekNowLineStyle,
  weekNowStyle,
} from "../../styles.js";
import type { WeekDayColumnProps } from "./types.js";

export const WeekDayColumn = ({ date, events, startHour, timeZone, now }: WeekDayColumnProps) => {
  const nowMinute = nowMinutesOnDate(now, date, timeZone);
  const blocks = layoutTimedEvents(splitAllDay(events).timed, date, timeZone);

  return (
    <div data-testid="week-day-column" style={weekColumnStyle}>
      {blocks.map((block) => (
        <div
          key={block.item.id}
          data-testid={`week-event-${block.item.id}`}
          style={weekBlockStyle(
            block.topMinutes - startHour * 60,
            Math.max(block.heightMinutes, WEEK_MIN_BLOCK_PX),
            block.column,
            block.columnCount,
            calendarAccentColor(block.item.calendarColor).background,
          )}
        >
          <div style={weekBlockTitleStyle}>{block.item.title}</div>
          <div style={weekBlockTimeStyle}>{formatClockTime(block.item.startsAt, timeZone)}</div>
        </div>
      ))}
      {nowMinute !== null && (
        <div data-testid="week-now" style={weekNowStyle(nowMinute - startHour * 60)}>
          <span style={weekNowDotStyle} />
          <span style={weekNowLineStyle} />
        </div>
      )}
    </div>
  );
};
