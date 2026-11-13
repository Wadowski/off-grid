// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import type { HiddenCalendars } from "../../calendar-views/events-by-calendar.js";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import type { CalendarLayoutContext, ShellContext } from "../../types.js";
import { CalendarSidebar } from "./components/calendar-sidebar/calendar-sidebar.js";
import { readHiddenCalendars, writeHiddenCalendars } from "./hidden-calendars-storage.js";
import { calendarLayoutContentStyle, calendarLayoutStyle } from "./styles.js";

// Places a calendar screen beside the calendar sidebar and owns the calendars a person hid.
export const CalendarLayout = () => {
  const shellContext = useOutletContext<ShellContext>();
  const narrow = useIsNarrow();
  const [hidden, setHiddenState] = useState<HiddenCalendars>(readHiddenCalendars);
  const setHidden = useCallback((next: HiddenCalendars) => {
    setHiddenState(next);
    writeHiddenCalendars(next);
  }, []);
  const layoutContext: CalendarLayoutContext = { ...shellContext, hidden, setHidden };

  return (
    <div style={calendarLayoutStyle(narrow)}>
      {!narrow && <CalendarSidebar calendars={shellContext.calendars.calendars} />}
      <div style={calendarLayoutContentStyle}>
        <Outlet context={layoutContext} />
      </div>
    </div>
  );
};
