// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarAccentColor } from "../../../../../../calendars/calendar-accents.js";
import { columnSpanInWeek } from "../../../../../../calendar-views/week-grid-range.js";
import { zonedMomentOf } from "../../../../../../calendar-views/time-format.js";
import { weekAllDayBarStyle, weekAllDayRowStyle } from "../../styles.js";
import type { WeekAllDayRowProps } from "./types.js";

export const WeekAllDayRow = ({ event, dates, timeZone }: WeekAllDayRowProps) => {
  const span = columnSpanInWeek(
    event.startDate ?? zonedMomentOf(event.startsAt, timeZone).date,
    event.endDate ?? zonedMomentOf(event.endsAt, timeZone).date,
    dates,
  );
  if (span === null) {
    return null;
  }
  return (
    <div style={weekAllDayRowStyle}>
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
};
