// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { CalendarSidebarToggleRow } from "../calendar-sidebar-toggle-row/calendar-sidebar-toggle-row.js";
import type { CalendarSidebarListProps } from "./types.js";
import { calendarListStyle } from "./styles.js";

export const CalendarSidebarList = ({ calendars, hidden, onToggle }: CalendarSidebarListProps) => {
  if (calendars.length === 0) {
    return null;
  }

  return (
    <ul style={calendarListStyle} data-testid="sidebar-calendar-list">
      {calendars.map((calendar) => (
        <li key={calendar.id}>
          <CalendarSidebarToggleRow
            calendar={calendar}
            checked={!hidden.has(calendar.id)}
            onToggle={onToggle}
          />
        </li>
      ))}
    </ul>
  );
};
