// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Fragment, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { splitAllDay } from "../../../../calendar-views/events-by-calendar.js";
import { formatGmtOffset, zonedMomentOf } from "../../../../calendar-views/time-format.js";
import { weekGridRange } from "../../../../calendar-views/week-grid-range.js";
import { mondayIndexOf } from "../../../../calendar-views/week-days.js";
import { nowMinutesOnDate } from "../../../../calendar-views/timeline-layout.js";
import { weekdayLetters, weekdayShortLabels } from "../../../../calendar-views/weekday-letters.js";
import { WeekAllDayRow } from "./components/week-all-day-row/week-all-day-row.js";
import { WeekDayColumn } from "./components/week-day-column/week-day-column.js";
import { WeekDayHeader } from "./components/week-day-header/week-day-header.js";
import { WeekNowLine } from "./components/week-now-line/week-now-line.js";
import { MINUTES_PER_HOUR, PHONE_WEEK_SIZE } from "./constants.js";
import {
  weekBodyStyle,
  weekDesktopDayCellStyle,
  weekGridScrollStyle,
  weekGutterLabelStyle,
  weekHeaderRowStyle,
  weekHourLabelStyle,
  weekHourLineStyle,
} from "./styles.js";
import type { WeekGridProps } from "./types.js";

const SCROLL_MARGIN_MINUTES = 24;

const hourLabel = (hour: number): string => `${String(hour).padStart(2, "0")}:00`;

export const WeekGrid = ({
  days,
  selectedDate,
  todayDate,
  timeZone,
  now,
  size = PHONE_WEEK_SIZE,
}: WeekGridProps) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dates = days.map((day) => day.date);
  const allTimed = days.flatMap((day) => splitAllDay(day.events).timed);
  const allDay = dedupeById(days.flatMap((day) => splitAllDay(day.events).allDay));
  const { startHour, endHour } = weekGridRange(allTimed, timeZone);
  const hourCount = endHour - startHour;
  const bodyHeight = hourCount * size.hourPx;
  const desktop = size.card === "detailed";
  const rangeStartMinute = startHour * MINUTES_PER_HOUR;
  const earliestMinute = allTimed.reduce(
    (earliest, event) => Math.min(earliest, zonedMomentOf(event.startsAt, timeZone).minutesOfDay),
    rangeStartMinute,
  );
  const scrollTargetPx = Math.max(
    0,
    ((earliestMinute - rangeStartMinute - SCROLL_MARGIN_MINUTES) * size.hourPx) / MINUTES_PER_HOUR,
  );
  const firstDate = dates[0] ?? selectedDate;
  const dayLetters = desktop ? weekdayShortLabels(t) : weekdayLetters(t);
  const todayMinute =
    desktop && dates.includes(todayDate) ? nowMinutesOnDate(now, todayDate, timeZone) : null;

  useEffect(() => {
    if (scrollRef.current !== null) {
      scrollRef.current.scrollTop = scrollTargetPx;
    }
  }, [firstDate, scrollTargetPx]);

  return (
    <section aria-label={t("calendar.mobileViews.weekGridLabel")}>
      <div
        ref={scrollRef}
        style={weekGridScrollStyle(size.scrollHeight, desktop)}
        tabIndex={size.scrollFocusable ? 0 : undefined}
        data-testid="week-grid"
      >
        <div style={weekHeaderRowStyle(size.gutter)}>
          <div style={weekGutterLabelStyle}>
            <Text
              variant="caption"
              value={t("calendar.mobileViews.gmtOffset", {
                offset: formatGmtOffset(selectedDate, timeZone),
              })}
            />
          </div>
          {days.map((day) => {
            const header = (
              <WeekDayHeader
                date={day.date}
                label={dayLetters[mondayIndexOf(day.date)] ?? ""}
                selected={day.date === selectedDate}
                today={day.date === todayDate}
                desktop={desktop}
              />
            );
            return size.card === "detailed" ? (
              <div key={day.date} style={weekDesktopDayCellStyle}>
                {header}
              </div>
            ) : (
              <Fragment key={day.date}>{header}</Fragment>
            );
          })}
        </div>
        {allDay.length > 0 && (
          <div>
            {allDay.map((event) => (
              <WeekAllDayRow
                key={event.id}
                event={event}
                dates={dates}
                timeZone={timeZone}
                gutter={size.gutter}
              />
            ))}
          </div>
        )}
        <div style={weekBodyStyle(bodyHeight, size.gutter)}>
          <div style={{ position: "relative" }}>
            {Array.from({ length: hourCount }, (_, index) => (
              <span key={index} style={weekHourLabelStyle(index, size.hourPx, desktop)}>
                {hourLabel(startHour + index)}
              </span>
            ))}
          </div>
          {!desktop &&
            Array.from({ length: hourCount }, (_, index) => (
              <span key={`line-${index}`} style={weekHourLineStyle(index, size)} />
            ))}
          {days.map((day) => (
            <WeekDayColumn
              key={day.date}
              date={day.date}
              events={day.events}
              startHour={startHour}
              timeZone={timeZone}
              now={now}
              hourPx={size.hourPx}
              card={size.card}
              today={day.date === todayDate}
            />
          ))}
          {todayMinute !== null && (
            <WeekNowLine
              topPx={
                (todayMinute - startHour * MINUTES_PER_HOUR) * (size.hourPx / MINUTES_PER_HOUR)
              }
              gutter={size.gutter}
              now={now}
              timeZone={timeZone}
            />
          )}
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
