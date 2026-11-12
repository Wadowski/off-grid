// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { ShellContext } from "../../types.js";
import { CalendarRow } from "./components/calendar-row/calendar-row.js";
import {
  calendarListStyle,
  calendarsHeaderStyle,
  calendarsPageStyle,
  statusStyle,
} from "./styles.js";

export const CalendarsPage = () => {
  const { calendars: calendarsState, families } = useOutletContext<ShellContext>();
  const navigate = useNavigate();
  const { calendars, listStatus } = calendarsState;

  return (
    <div style={calendarsPageStyle}>
      <div style={calendarsHeaderStyle}>
        <Text variant="heading" textId="calendar.calendars.heading" />
        <Button
          variant="primary"
          data-testid="calendars-new"
          onClick={() => navigate("/calendar/new")}
        >
          <Text variant="action" textId="calendar.calendars.create" />
        </Button>
      </div>
      {listStatus === "loading" && (
        <div style={statusStyle} role="status">
          <Text variant="body" textId="calendar.calendars.loading" />
        </div>
      )}
      {listStatus === "failed" && (
        <div style={statusStyle} role="alert">
          <Text variant="error" textId="calendar.calendars.loadFailed" />
          <Text variant="error" textId="calendar.errors.failed" />
        </div>
      )}
      {listStatus === "ready" && calendars.length === 0 && (
        <Text variant="body" textId="calendar.calendars.empty" />
      )}
      {listStatus === "ready" && calendars.length > 0 && (
        <ul style={calendarListStyle} data-testid="calendar-list">
          {calendars.map((calendar) => (
            <li key={calendar.id}>
              <CalendarRow
                calendar={calendar}
                familyName={families.find((family) => family.id === calendar.familyId)?.name}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
