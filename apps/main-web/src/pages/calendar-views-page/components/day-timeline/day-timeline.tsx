// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../../../calendars/calendar-accents.js";
import { splitAllDay } from "../../../../calendar-views/events-by-calendar.js";
import { layoutTimedEvents, nowMinutesOnDate } from "../../../../calendar-views/timeline-layout.js";
import { formatClockTime } from "../../../../calendar-views/time-format.js";
import { useIsNarrow } from "../../../../media/use-is-narrow.js";
import { HOUR_HEIGHT_PX, HOURS_PER_DAY, MIN_TIMELINE_BLOCK_PX, minutesToPx } from "./constants.js";
import { TimelineEventBlock } from "./components/timeline-event-block/timeline-event-block.js";
import {
  timelineAllDayChipStyle,
  timelineAllDayRowStyle,
  timelineCanvasStyle,
  timelineFillScrollStyle,
  timelineFillSectionStyle,
  timelineHourLabelStyle,
  timelineHourLineStyle,
  timelineHourRowStyle,
  timelineNowBadgeStyle,
  timelineNowDotStyle,
  timelineNowLineStyle,
  timelineNowStyle,
  timelinePhoneScrollStyle,
  timelineScrollStyle,
} from "./styles.js";
import type { DayTimelineProps } from "./types.js";

const FIRST_SCROLL_HOUR = 8;
const SCROLL_MARGIN_PX = 24;
// On phone the window scrolls to the first event; this keeps it clear of the app header and the sticky days row.
const PHONE_STICKY_CLEARANCE_PX = 160;
const HOURS = Array.from({ length: HOURS_PER_DAY }, (_, hour) => hour);

const hourLabel = (hour: number): string => `${String(hour).padStart(2, "0")}:00`;

export const DayTimeline = ({ events, date, timeZone, now }: DayTimelineProps) => {
  const { t } = useTranslation();
  const narrow = useIsNarrow();
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
    const region = scrollRef.current;
    if (region === null) {
      return;
    }
    if (narrow) {
      // On phone the hours flow with the page, so the window moves to the first event.
      const regionTop = region.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, regionTop + scrollTargetPx - PHONE_STICKY_CLEARANCE_PX) });
    } else {
      region.scrollTop = scrollTargetPx;
    }
  }, [date, narrow, scrollTargetPx]);

  // Desktop fills the height the page gives it and scrolls inside it; phone lets the page scroll.
  const sectionStyle = narrow ? undefined : timelineFillSectionStyle;
  const scrollStyle = narrow
    ? timelinePhoneScrollStyle
    : { ...timelineScrollStyle, ...timelineFillScrollStyle };

  return (
    <section style={sectionStyle}>
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
      <div
        ref={scrollRef}
        role="region"
        tabIndex={0}
        className="og-focusable"
        aria-label={t("calendar.mobileViews.timelineLabel")}
        style={scrollStyle}
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
