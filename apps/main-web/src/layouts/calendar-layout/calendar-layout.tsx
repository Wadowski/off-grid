// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Outlet, useOutletContext } from "react-router-dom";
import type { ShellContext } from "../../types.js";
import { CalendarSidebar } from "./components/calendar-sidebar/calendar-sidebar.js";
import { calendarLayoutCss } from "./styles.js";

// Places a calendar screen beside the calendar sidebar. No route uses it yet.
export const CalendarLayout = () => {
  const shellContext = useOutletContext<ShellContext>();

  return (
    <div className="og-calendar-layout">
      <style>{calendarLayoutCss}</style>
      <CalendarSidebar calendars={shellContext.calendars.calendars} />
      <div className="og-calendar-layout-content">
        <Outlet context={shellContext} />
      </div>
    </div>
  );
};
