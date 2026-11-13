// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { Outlet, useOutletContext } from "react-router-dom";
import { useOpenNewEvent } from "../../calendar-events/use-open-new-event.js";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import type { ShellContext } from "../../types.js";
import { CalendarSidebar } from "./components/calendar-sidebar/calendar-sidebar.js";
import { calendarLayoutContentStyle, calendarLayoutStyle } from "./styles.js";

// Places a calendar screen beside the calendar sidebar.
export const CalendarLayout = () => {
  const shellContext = useOutletContext<ShellContext>();
  const narrow = useIsNarrow();
  const openNewEvent = useOpenNewEvent();

  return (
    <div style={calendarLayoutStyle(narrow)}>
      {!narrow && (
        <CalendarSidebar calendars={shellContext.calendars.calendars}>
          <Button variant="primary" onClick={openNewEvent}>
            <Text variant="action" textId="calendar.event.new" />
          </Button>
        </CalendarSidebar>
      )}
      <div style={calendarLayoutContentStyle}>
        <Outlet context={shellContext} />
      </div>
    </div>
  );
};
