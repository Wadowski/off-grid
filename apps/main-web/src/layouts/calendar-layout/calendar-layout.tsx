// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Outlet, useOutletContext } from "react-router-dom";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import type { ShellContext } from "../../types.js";
import { CalendarSidebar } from "./components/calendar-sidebar/calendar-sidebar.js";
import { calendarLayoutContentStyle, calendarLayoutStyle } from "./styles.js";

// Places a calendar screen beside the calendar sidebar. No route uses it yet.
export const CalendarLayout = () => {
  const shellContext = useOutletContext<ShellContext>();
  const narrow = useIsNarrow();

  return (
    <div style={calendarLayoutStyle(narrow)}>
      {!narrow && <CalendarSidebar calendars={shellContext.calendars.calendars} />}
      <div style={calendarLayoutContentStyle}>
        <Outlet context={shellContext} />
      </div>
    </div>
  );
};
