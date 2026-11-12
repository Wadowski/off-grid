// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Tag, Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { calendarAccentColor } from "../../../../calendars/calendar-accents.js";
import type { CalendarRowProps } from "./types.js";
import {
  calendarRowNameStyle,
  calendarRowStyle,
  calendarRowTextStyle,
  colorDotStyle,
} from "./styles.js";

export const CalendarRow = ({ calendar, familyName }: CalendarRowProps) => (
  <Link
    to={`/calendar/${calendar.id}`}
    className="og-focusable"
    style={calendarRowStyle}
    data-testid="calendar-row"
  >
    <span
      aria-hidden="true"
      style={colorDotStyle(calendarAccentColor(calendar.color).background)}
    />
    <span style={calendarRowTextStyle}>
      <span style={calendarRowNameStyle}>
        <Text variant="body" value={calendar.name} />
      </span>
      {calendar.familyId === null ? (
        <Text variant="caption" textId="calendar.calendars.personal" />
      ) : (
        <Text variant="caption" value={familyName ?? ""} />
      )}
    </span>
    {calendar.isDefault && (
      <Tag tone="accent">
        <Text variant="caption" textId="calendar.calendars.default" />
      </Tag>
    )}
  </Link>
);
