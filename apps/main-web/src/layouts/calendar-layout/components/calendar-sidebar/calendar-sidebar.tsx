// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { CalendarSidebarList } from "./components/calendar-sidebar-list/calendar-sidebar-list.js";
import type { CalendarSidebarProps } from "./types.js";
import {
  calendarSidebarSlotStyle,
  calendarSidebarStyle,
  manageCalendarsLinkStyle,
} from "./styles.js";

export const CalendarSidebar = ({
  calendars,
  hidden,
  onToggle,
  children,
}: CalendarSidebarProps) => (
  <aside
    style={calendarSidebarStyle}
    aria-labelledby="calendar-sidebar-heading"
    data-testid="calendar-sidebar"
  >
    {children !== undefined && (
      <div style={calendarSidebarSlotStyle} data-testid="calendar-sidebar-slot">
        {children}
      </div>
    )}
    <Text variant="label" id="calendar-sidebar-heading" textId="calendar.calendars.heading" />
    <CalendarSidebarList calendars={calendars} hidden={hidden} onToggle={onToggle} />
    <Link to="/calendar/calendars" className="og-focusable" style={manageCalendarsLinkStyle}>
      <Text variant="link" textId="calendar.desktop.manageCalendars" />
    </Link>
  </aside>
);
