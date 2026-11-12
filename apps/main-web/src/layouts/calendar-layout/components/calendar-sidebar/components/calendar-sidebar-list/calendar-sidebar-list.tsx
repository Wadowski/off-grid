// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { NavLink } from "react-router-dom";
import { calendarAccentColor } from "../../../../../../calendars/calendar-accents.js";
import type { CalendarSidebarListProps } from "./types.js";
import { calendarListStyle, colorDotStyle } from "./styles.js";

export const CalendarSidebarList = ({ calendars }: CalendarSidebarListProps) => {
  if (calendars.length === 0) {
    return null;
  }

  return (
    <ul style={calendarListStyle} data-testid="sidebar-calendar-list">
      {calendars.map((calendar) => (
        <li key={calendar.id}>
          <NavLink
            to={`/calendar/${calendar.id}`}
            end
            className="og-calendar-sidebar-row og-focusable"
            data-testid="sidebar-calendar-row"
          >
            <span
              aria-hidden="true"
              style={colorDotStyle(calendarAccentColor(calendar.color).background)}
            />
            <span className="og-calendar-sidebar-name">
              <Text variant="body" value={calendar.name} />
            </span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
};
