// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../../../calendars/calendar-accents.js";
import { splitAllDay } from "../../../../calendar-views/events-by-calendar.js";
import { layoutTimedEvents, nowMinutesOnDate } from "../../../../calendar-views/timeline-layout.js";
import { formatClockTime } from "../../../../calendar-views/time-format.js";
import { HOUR_HEIGHT_PX, HOURS_PER_DAY, MIN_TIMELINE_BLOCK_PX, minutesToPx } from "./constants.js";
import { TimelineEventBlock } from "./components/timeline-event-block/timeline-event-block.js";
import {
  timelineAllDayChipStyle,
  timelineAllDayRowStyle,
  timelineCanvasStyle,
  timelineHourLabelStyle,
  timelineHourLineStyle,
  timelineHourRowStyle,
  timelineNowBadgeStyle,
  timelineNowDotStyle,
  timelineNowLineStyle,
  timelineNowStyle,
  timelineScrollStyle,
} from "./styles.js";
import type { DayTimelineProps } from "./types.js";

const FIRST_SCROLL_HOUR = 8;
const SCROLL_MARGIN_PX = 24;
const HOURS = Array.from({ length: HOURS_PER_DAY }, (_, hour) => hour);

const hourLabel = (hour: number): string => `${String(hour).padStart(2, "0")}:00`;

export const DayTimeline = ({ events, date, timeZone, now }: DayTimelineProps) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { allDay, timed } = splitAllDay(events);
  const blocks = layoutTimedEvents(timed, date, timeZone);
  const nowMinute = nowMinutesOnDate(now, date, timeZone);
  const earliestMinute = blocks.reduce(
    (earliest, block) => Math.min(earliest, block.topMinutes),
    FIRST_SCROLL_HOUR * 60,
  );
  const scrollTargetPx = Math.max(0, minutesToPx(earliestMinute) - SCROLL_MARGIN_PX);

  useEffect(() => {
    if (scrollRef.current !== null) {
      scrollRef.current.scrollTop = scrollTargetPx;
    }
  }, [date, scrollTargetPx]);

  return (
    <section>
      {allDay.length > 0 && (
        <ul style={timelineAllDayRowStyle}>
          {allDay.map((event) => (
            <li key={event.id}>
              <span
                style={timelineAllDayChipStyle(calendarAccentColor(event.calendarColor).background)}
              >
                <Text variant="label" value={event.title} />
              </span>
            </li>
          ))}
        </ul>
      )}
      {events.length === 0 && (
        <Text variant="body" textId="calendar.mobileViews.nothingScheduled" />
      )}
      <div
        ref={scrollRef}
        role="region"
        tabIndex={0}
        className="og-focusable"
        aria-label={t("calendar.mobileViews.timelineLabel")}
        style={timelineScrollStyle}
        data-testid="day-timeline"
      >
        <div style={timelineCanvasStyle}>
          {HOURS.map((hour) => (
            <div key={hour} style={timelineHourRowStyle(hour)}>
              <span style={timelineHourLabelStyle}>{hourLabel(hour)}</span>
              <span style={timelineHourLineStyle} />
            </div>
          ))}
          {nowMinute !== null && (
            <div style={timelineNowStyle(minutesToPx(nowMinute))} data-testid="timeline-now">
              <span style={timelineNowDotStyle} />
              <span style={timelineNowLineStyle} />
              <span style={timelineNowBadgeStyle}>
                {formatClockTime(now.toISOString(), timeZone)}
              </span>
            </div>
          )}
          {blocks.map((block) => (
            <TimelineEventBlock
              key={block.item.id}
              event={block.item}
              timeZone={timeZone}
              topPx={minutesToPx(block.topMinutes)}
              heightPx={Math.max(
                (block.heightMinutes * HOUR_HEIGHT_PX) / 60,
                MIN_TIMELINE_BLOCK_PX,
              )}
              column={block.column}
              columnCount={block.columnCount}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
