// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { splitAllDay } from "../../../../../../calendar-views/events-by-calendar.js";
import {
  layoutTimedEvents,
  nowMinutesOnDate,
} from "../../../../../../calendar-views/timeline-layout.js";
import { MINUTES_PER_HOUR } from "../../constants.js";
import { formatClockTime } from "../../../../../../calendar-views/time-format.js";
import {
  weekColumnStyle,
  weekNowBadgeStyle,
  weekNowDotStyle,
  weekNowLineStyle,
  weekNowStyle,
} from "../../styles.js";
import { WeekEventBlock } from "../week-event-block/week-event-block.js";
import type { WeekDayColumnProps } from "./types.js";

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
    <div data-testid="week-day-column" style={weekColumnStyle(card)}>
      {blocks.map((block) => (
        <WeekEventBlock
          key={block.item.id}
          block={block}
          startHour={startHour}
          pxPerMinute={pxPerMinute}
          timeZone={timeZone}
          card={card}
        />
      ))}
      {nowMinute !== null && (
        <div
          data-testid="week-now"
          style={weekNowStyle((nowMinute - startHour * MINUTES_PER_HOUR) * pxPerMinute)}
        >
          <span style={weekNowDotStyle} />
          <span style={weekNowLineStyle} />
          {card === "detailed" && (
            <span style={weekNowBadgeStyle} data-testid="week-now-time">
              {formatClockTime(now.toISOString(), timeZone)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
