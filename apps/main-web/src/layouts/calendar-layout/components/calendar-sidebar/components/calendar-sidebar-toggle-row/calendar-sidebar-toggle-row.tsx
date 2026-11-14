// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Checkbox, Text } from "@offgrid/ui";
import { calendarAccentColor } from "../../../../../../calendars/calendar-accents.js";
import type { CalendarSidebarToggleRowProps } from "./types.js";
import { toggleRowDotStyle, toggleRowNameStyle } from "./styles.js";

export const CalendarSidebarToggleRow = ({
  calendar,
  checked,
  onToggle,
}: CalendarSidebarToggleRowProps) => (
  <Checkbox
    checked={checked}
    onChange={() => onToggle(calendar.id)}
    data-testid="sidebar-calendar-row"
    label={
      <>
        <span
          aria-hidden="true"
          style={toggleRowDotStyle(calendarAccentColor(calendar.color).background)}
        />
        <span style={toggleRowNameStyle}>
          <Text variant="body" value={calendar.name} />
        </span>
      </>
    }
  />
);
