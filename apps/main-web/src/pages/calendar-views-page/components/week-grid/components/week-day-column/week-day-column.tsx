// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { splitAllDay } from "../../../../../../calendar-views/events-by-calendar.js";
import {
  layoutTimedEvents,
  nowMinutesOnDate,
} from "../../../../../../calendar-views/timeline-layout.js";
import { MINUTES_PER_HOUR } from "../../constants.js";
import { weekColumnStyle, weekNowDotStyle, weekNowLineStyle, weekNowStyle } from "../../styles.js";
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
  today,
}: WeekDayColumnProps) => {
  const pxPerMinute = hourPx / MINUTES_PER_HOUR;
  // The desktop week draws one now-line across all columns (see WeekNowLine).
  const nowMinute = card === "compact" ? nowMinutesOnDate(now, date, timeZone) : null;
  const blocks = layoutTimedEvents(splitAllDay(events).timed, date, timeZone);

  return (
    <div data-testid="week-day-column" style={weekColumnStyle(card, today)}>
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
        </div>
      )}
    </div>
  );
};
