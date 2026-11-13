// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useState } from "react";
import { Outlet, useOutletContext, useSearchParams } from "react-router-dom";
import type { HiddenCalendars } from "../../calendar-views/events-by-calendar.js";
import { parseDateParam } from "../../calendar-views/view-navigation.js";
import { localDateOf } from "../../calendar-views/week-days.js";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import type { CalendarLayoutContext, ShellContext } from "../../types.js";
import { CalendarSidebar } from "./components/calendar-sidebar/calendar-sidebar.js";
import { CalendarMiniMonth } from "./components/calendar-sidebar/components/calendar-mini-month/calendar-mini-month.js";
import { readHiddenCalendars, writeHiddenCalendars } from "./hidden-calendars-storage.js";
import { calendarLayoutContentStyle, calendarLayoutStyle } from "./styles.js";

export const CalendarLayout = () => {
  const shellContext = useOutletContext<ShellContext>();
  const narrow = useIsNarrow();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDate = parseDateParam(searchParams.get("date")) ?? localDateOf(new Date());
  const today = localDateOf(new Date());
  const [hidden, setHiddenState] = useState<HiddenCalendars>(readHiddenCalendars);
  const setHidden = useCallback((next: HiddenCalendars) => {
    setHiddenState(next);
    writeHiddenCalendars(next);
  }, []);
  const toggleCalendar = useCallback(
    (calendarId: string) => {
      const next = new Set(hidden);
      if (next.has(calendarId)) {
        next.delete(calendarId);
      } else {
        next.add(calendarId);
      }
      setHidden(next);
    },
    [hidden, setHidden],
  );
  const layoutContext: CalendarLayoutContext = { ...shellContext, hidden, setHidden };

  return (
    <div style={calendarLayoutStyle(narrow)}>
      {!narrow && (
        <CalendarSidebar
          calendars={shellContext.calendars.calendars}
          hidden={hidden}
          onToggle={toggleCalendar}
        >
          <CalendarMiniMonth
            selectedDate={selectedDate}
            todayDate={today}
            onSelect={(date) => setSearchParams({ date })}
          />
        </CalendarSidebar>
      )}
      <div style={calendarLayoutContentStyle}>
        <Outlet context={layoutContext} />
      </div>
    </div>
  );
};
