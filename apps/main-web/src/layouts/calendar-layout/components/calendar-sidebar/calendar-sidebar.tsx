// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { CalendarSidebarList } from "./components/calendar-sidebar-list/calendar-sidebar-list.js";
import type { CalendarSidebarProps } from "./types.js";
import { calendarSidebarCss } from "./styles.js";

export const CalendarSidebar = ({ calendars, children }: CalendarSidebarProps) => (
  <aside
    className="og-calendar-sidebar"
    aria-labelledby="calendar-sidebar-heading"
    data-testid="calendar-sidebar"
  >
    <style>{calendarSidebarCss}</style>
    {children !== undefined && (
      <div className="og-calendar-sidebar-slot" data-testid="calendar-sidebar-slot">
        {children}
      </div>
    )}
    <Text variant="label" id="calendar-sidebar-heading" textId="calendar.calendars.heading" />
    <CalendarSidebarList calendars={calendars} />
  </aside>
);
