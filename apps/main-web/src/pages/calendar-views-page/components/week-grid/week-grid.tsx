// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { splitAllDay } from "../../../../calendar-views/events-by-calendar.js";
import { formatGmtOffset, zonedMomentOf } from "../../../../calendar-views/time-format.js";
import { weekGridRange } from "../../../../calendar-views/week-grid-range.js";
import { mondayIndexOf } from "../../../../calendar-views/week-days.js";
import { weekdayLetters } from "../../../../calendar-views/weekday-letters.js";
import { WeekAllDayRow } from "./components/week-all-day-row/week-all-day-row.js";
import { WeekDayColumn } from "./components/week-day-column/week-day-column.js";
import { WeekDayHeader } from "./components/week-day-header/week-day-header.js";
import { WEEK_HOUR_PX } from "./constants.js";
import {
  weekBodyStyle,
  weekGridScrollStyle,
  weekGutterLabelStyle,
  weekHeaderRowStyle,
  weekHourLabelStyle,
  weekHourLineStyle,
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
  const dayLetters = weekdayLetters(t);

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
            <Text
              variant="caption"
              value={t("calendar.mobileViews.gmtOffset", {
                offset: formatGmtOffset(selectedDate, timeZone),
              })}
            />
          </div>
          {days.map((day) => (
            <WeekDayHeader
              key={day.date}
              date={day.date}
              label={dayLetters[mondayIndexOf(day.date)] ?? ""}
              selected={day.date === selectedDate}
              today={day.date === todayDate}
            />
          ))}
        </div>
        {allDay.length > 0 && (
          <div>
            {allDay.map((event) => (
              <WeekAllDayRow key={event.id} event={event} dates={dates} timeZone={timeZone} />
            ))}
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
          {days.map((day) => (
            <WeekDayColumn
              key={day.date}
              date={day.date}
              events={day.events}
              startHour={startHour}
              timeZone={timeZone}
              now={now}
            />
          ))}
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
