// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { useState } from "react";
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { webCalendarClient } from "../../api/web-api-client.js";
import { DEFAULT_EVENT_BACKGROUND } from "../../calendar-events/constants.js";
import { notifyEventsChanged } from "../../calendar-events/notify-events-changed.js";
import { eventToFormValues } from "../../calendar-events/event-to-form-values.js";
import { DeleteConfirm } from "../../calendar-events/event-details/components/delete-confirm/delete-confirm.js";
import { EventDetailsModal } from "../../calendar-events/event-details/event-details-modal/event-details-modal.js";
import { EventDetailsPage } from "../../calendar-events/event-details/event-details-page/event-details-page.js";
import { useCalendarEvent } from "../../calendar-events/event-details/use-calendar-event.js";
import { NewEventModal } from "../../calendar-events/new-event-modal/new-event-modal.js";
import { readBackground, viewOfBackground } from "../../calendar-events/new-event-route.js";
import { useCalendarTimeZone } from "../../calendar-views/use-calendar-time-zone.js";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import type { ShellContext } from "../../types.js";
import { CalendarViewsPage } from "../calendar-views-page/calendar-views-page.js";
import type { DetailsMode } from "./types.js";

export const CalendarEventDetailsPage = () => {
  const { eventId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const shellContext = useOutletContext<ShellContext>();
  const narrow = useIsNarrow();
  const { timeZone } = useCalendarTimeZone(true);
  const background = readBackground(location.state);
  const { status, event, retry } = useCalendarEvent(eventId);
  const [mode, setMode] = useState<DetailsMode>("view");
  const [deleting, setDeleting] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);

  const leave = () => navigate(background ?? DEFAULT_EVENT_BACKGROUND, { replace: true });

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteFailed(false);
    try {
      await webCalendarClient.removeCalendarEvent(eventId);
      notifyEventsChanged();
      leave();
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 404) {
        notifyEventsChanged();
        leave();
        return;
      }
      setDeleting(false);
      setDeleteFailed(true);
    }
  };

  const calendar = shellContext.calendars.calendars.find(
    (candidate) => candidate.id === event?.calendarId,
  );
  const shownEvent =
    event === undefined
      ? undefined
      : {
          ...event,
          calendarName: event.calendarName ?? calendar?.name,
          calendarColor: event.calendarColor ?? calendar?.color,
        };

  const saveReminders = async (offsets: readonly number[]) => {
    await webCalendarClient.updateCalendarEvent(eventId, {
      reminderOffsetsMinutes: [...offsets],
    });
    notifyEventsChanged();
  };

  const shell = {
    event: shownEvent,
    status,
    retry,
    timeZone,
    onEdit: () => setMode("edit"),
    onSaveReminders: saveReminders,
    onDelete: () => {
      setDeleteFailed(false);
      setMode("confirmDelete");
    },
  };

  const editing =
    mode === "edit" && event !== undefined
      ? { eventId, initialValues: eventToFormValues(event, timeZone) }
      : undefined;

  const details =
    editing !== undefined ? (
      <NewEventModal
        calendars={shellContext.calendars.calendars}
        timeZone={timeZone}
        editing={editing}
        onClose={() => setMode("view")}
        onSaved={() => setMode("view")}
      />
    ) : narrow ? (
      <EventDetailsPage {...shell} onBack={leave} />
    ) : (
      <EventDetailsModal {...shell} onClose={leave} />
    );

  return (
    <>
      {!narrow && <CalendarViewsPage view={viewOfBackground(background)} />}
      {details}
      {mode === "confirmDelete" && (
        <DeleteConfirm
          narrow={narrow}
          deleting={deleting}
          failed={deleteFailed}
          onCancel={() => setMode("view")}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </>
  );
};
