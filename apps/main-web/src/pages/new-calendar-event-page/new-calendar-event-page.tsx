// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { NewEventModal } from "../../calendar-events/new-event-modal/new-event-modal.js";
import { DEFAULT_EVENT_BACKGROUND } from "../../calendar-events/constants.js";
import { readBackground, viewOfBackground } from "../../calendar-events/new-event-route.js";
import { useCalendarTimeZone } from "../../calendar-views/use-calendar-time-zone.js";
import type { ShellContext } from "../../types.js";
import { CalendarViewsPage } from "../calendar-views-page/calendar-views-page.js";

export const NewCalendarEventPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const shellContext = useOutletContext<ShellContext>();
  const { timeZone } = useCalendarTimeZone(true);
  const background = readBackground(location.state);

  const leave = () => navigate(background ?? DEFAULT_EVENT_BACKGROUND, { replace: true });

  return (
    <>
      <CalendarViewsPage view={viewOfBackground(background)} />
      <NewEventModal
        calendars={shellContext.calendars.calendars}
        timeZone={timeZone}
        onClose={leave}
        onSaved={leave}
      />
    </>
  );
};
