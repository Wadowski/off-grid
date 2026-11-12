// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { calendarAccentColor } from "../../../../../../calendars/calendar-accents.js";
import type { SidebarCalendarListProps } from "./types.js";
import { calendarListStyle, calendarNameStyle, calendarRowStyle, colorDotStyle } from "./styles.js";

export const SidebarCalendarList = ({ calendars }: SidebarCalendarListProps) => {
  if (calendars.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="sidebar-calendars-heading" data-testid="sidebar-calendar-list">
      <Text variant="label" id="sidebar-calendars-heading" textId="calendar.calendars.heading" />
      <ul style={calendarListStyle}>
        {calendars.map((calendar) => (
          <li key={calendar.id}>
            <Link
              to={`/calendar/${calendar.id}`}
              style={calendarRowStyle}
              className="og-focusable"
              data-testid="sidebar-calendar-row"
            >
              <span
                aria-hidden="true"
                style={colorDotStyle(calendarAccentColor(calendar.color).background)}
              />
              <span style={calendarNameStyle}>
                <Text variant="body" value={calendar.name} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
