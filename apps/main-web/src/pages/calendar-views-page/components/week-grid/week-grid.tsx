// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../../../calendars/calendar-accents.js";
import { splitAllDay } from "../../../../calendar-views/events-by-calendar.js";
import {
  formatClockTime,
  formatGmtOffset,
  zonedMomentOf,
} from "../../../../calendar-views/time-format.js";
import { layoutTimedEvents, nowMinutesOnDate } from "../../../../calendar-views/timeline-layout.js";
import { columnSpanInWeek, weekGridRange } from "../../../../calendar-views/week-grid-range.js";
import { mondayIndexOf } from "../../../../calendar-views/week-days.js";
import { WEEK_HOUR_PX, WEEK_MIN_BLOCK_PX } from "./constants.js";
import {
  weekAllDayBarStyle,
  weekAllDayRowStyle,
  weekBlockStyle,
  weekBlockTimeStyle,
  weekBlockTitleStyle,
  weekBodyStyle,
  weekColumnStyle,
  weekDayHeaderStyle,
  weekDayNumberStyle,
  weekGridScrollStyle,
  weekGutterLabelStyle,
  weekHeaderRowStyle,
  weekHourLabelStyle,
  weekHourLineStyle,
  weekNowDotStyle,
  weekNowLineStyle,
  weekNowStyle,
  weekTodayDotStyle,
} from "./styles.js";
import type { WeekGridProps } from "./types.js";

const SCROLL_MARGIN_PX = 24;

const hourLabel = (hour: number): string => `${String(hour).padStart(2, "0")}:00`;

export const WeekGrid = ({ days, selectedDate, todayDate, timeZone, now }: WeekGridProps) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dates = days.map((day) => day.date);
  const allTimed = days.flatMap((day) => splitAllDay(day.events).timed);
  const allDay = dedupeById(days.flatMap((day) => splitAllDay(day.events).allDay));
  const { startHour, endHour } = weekGridRange(allTimed, timeZone);
  const hourCount = endHour - startHour;
  const bodyHeight = hourCount * WEEK_HOUR_PX;
  const earliestMinute = allTimed.reduce(
    (earliest, event) => Math.min(earliest, zonedMomentOf(event.startsAt, timeZone).minutesOfDay),
    startHour * 60,
  );
  const scrollTargetPx = Math.max(0, earliestMinute - startHour * 60 - SCROLL_MARGIN_PX);
  const firstDate = dates[0] ?? selectedDate;
  const dayLetters = [
    t("calendar.mobileViews.weekdayMonday"),
    t("calendar.mobileViews.weekdayTuesday"),
    t("calendar.mobileViews.weekdayWednesday"),
    t("calendar.mobileViews.weekdayThursday"),
    t("calendar.mobileViews.weekdayFriday"),
    t("calendar.mobileViews.weekdaySaturday"),
    t("calendar.mobileViews.weekdaySunday"),
  ];

  useEffect(() => {
    if (scrollRef.current !== null) {
      scrollRef.current.scrollTop = scrollTargetPx;
    }
  }, [firstDate, scrollTargetPx]);

  return (
    <section aria-label={t("calendar.mobileViews.weekGridLabel")}>
      <div ref={scrollRef} style={weekGridScrollStyle} data-testid="week-grid">
        <div style={weekHeaderRowStyle}>
          <div style={weekGutterLabelStyle}>
            {t("calendar.mobileViews.gmtOffset", {
              offset: formatGmtOffset(selectedDate, timeZone),
            })}
          </div>
          {days.map((day) => (
            <div key={day.date} style={weekDayHeaderStyle(day.date === todayDate)}>
              <span>{dayLetters[mondayIndexOf(day.date)]}</span>
              <span style={weekDayNumberStyle(day.date === selectedDate)}>
                {Number(day.date.slice(8))}
              </span>
              {day.date === todayDate && day.date !== selectedDate ? (
                <span style={weekTodayDotStyle} />
              ) : null}
            </div>
          ))}
        </div>
        {allDay.length > 0 && (
          <div>
            {allDay.map((event) => {
              const span = columnSpanInWeek(
                event.startDate ?? zonedMomentOf(event.startsAt, timeZone).date,
                event.endDate ?? zonedMomentOf(event.endsAt, timeZone).date,
                dates,
              );
              if (span === null) {
                return null;
              }
              return (
                <div key={event.id} style={weekAllDayRowStyle}>
                  <span />
                  <div
                    style={{
                      ...weekAllDayBarStyle(calendarAccentColor(event.calendarColor).background),
                      gridColumn: `${span.startColumn + 2} / ${span.endColumn + 3}`,
                    }}
                  >
                    {event.title}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={weekBodyStyle(bodyHeight)}>
          <div style={{ position: "relative" }}>
            {Array.from({ length: hourCount }, (_, index) => (
              <span key={index} style={weekHourLabelStyle(index)}>
                {hourLabel(startHour + index)}
              </span>
            ))}
          </div>
          {Array.from({ length: hourCount }, (_, index) => (
            <span key={`line-${index}`} style={weekHourLineStyle(index)} />
          ))}
          {days.map((day) => {
            const nowMinute = nowMinutesOnDate(now, day.date, timeZone);
            const blocks = layoutTimedEvents(splitAllDay(day.events).timed, day.date, timeZone);
            return (
              <div key={day.date} data-testid="week-day-column" style={weekColumnStyle}>
                {blocks.map((block) => {
                  const color = calendarAccentColor(block.item.calendarColor).background;
                  return (
                    <div
                      key={block.item.id}
                      data-testid={`week-event-${block.item.id}`}
                      style={weekBlockStyle(
                        block.topMinutes - startHour * 60,
                        Math.max(block.heightMinutes, WEEK_MIN_BLOCK_PX),
                        block.column,
                        block.columnCount,
                        color,
                      )}
                    >
                      <div style={weekBlockTitleStyle}>{block.item.title}</div>
                      <div style={weekBlockTimeStyle}>
                        {formatClockTime(block.item.startsAt, timeZone)}
                      </div>
                    </div>
                  );
                })}
                {nowMinute !== null && (
                  <div data-testid="week-now" style={weekNowStyle(nowMinute - startHour * 60)}>
                    <span style={weekNowDotStyle} />
                    <span style={weekNowLineStyle} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const dedupeById = <Event extends { readonly id: string }>(events: readonly Event[]): Event[] => {
  const seen = new Set<string>();
  return events.filter((event) => {
    if (seen.has(event.id)) {
      return false;
    }
    seen.add(event.id);
    return true;
  });
};
