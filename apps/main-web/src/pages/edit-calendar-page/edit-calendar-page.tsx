// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { removeCalendar, updateCalendar } from "../../calendars/calendar-api.js";
import { narrowCardPageStyle } from "../families-page/styles.js";
import {
  toCalendarErrorTextId,
  type CalendarErrorTextId,
} from "../../calendars/to-calendar-error-text-id.js";
import type { CalendarSaveStatus } from "../../calendars/types.js";
import { CalendarForm } from "../../forms/calendar-form/calendar-form.js";
import type { CalendarFormValues } from "../../forms/calendar-form/types.js";
import type { ShellContext } from "../../types.js";
import { AccountIntro } from "../create-account-page/components/account-intro/account-intro.js";
import { DeleteCalendarPanel } from "./components/delete-calendar-panel/delete-calendar-panel.js";
import { calendarStateStyle } from "./styles.js";

export const EditCalendarPage = () => {
  const { calendarId = "" } = useParams();
  const { families, calendars } = useOutletContext<ShellContext>();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState<CalendarSaveStatus>("idle");
  const [saveErrorTextId, setSaveErrorTextId] = useState<CalendarErrorTextId | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteErrorTextId, setDeleteErrorTextId] = useState<CalendarErrorTextId | undefined>(
    undefined,
  );

  if (calendars.listStatus === "loading") {
    return (
      <div style={calendarStateStyle} role="status">
        <Text variant="body" textId="calendar.calendars.loading" />
      </div>
    );
  }

  if (calendars.listStatus === "failed") {
    return (
      <div style={calendarStateStyle} role="alert">
        <Text variant="error" textId="calendar.calendars.loadFailed" />
      </div>
    );
  }

  const calendar = calendars.calendars.find((candidate) => candidate.id === calendarId);
  const backLink = (
    <Link to="/calendar/calendars" className="og-focusable" data-testid="calendar-back">
      <Text variant="link" textId="calendar.calendars.backToList" />
    </Link>
  );

  if (calendar === undefined) {
    return (
      <div style={narrowCardPageStyle}>
        <div style={calendarStateStyle} role="alert">
          <Text variant="error" textId="calendar.errors.notFound" />
          {backLink}
        </div>
      </div>
    );
  }

  const saveCalendar = async ({ name, color }: CalendarFormValues) => {
    setSaveStatus("submitting");
    setSaveErrorTextId(undefined);
    try {
      await updateCalendar(calendarId, { name, color });
    } catch (error) {
      setSaveStatus("failed");
      setSaveErrorTextId(toCalendarErrorTextId(error));
      return;
    }
    await calendars.refreshCalendars();
    navigate("/calendar/calendars");
  };

  const deleteCalendar = async () => {
    setDeleting(true);
    setDeleteErrorTextId(undefined);
    try {
      await removeCalendar(calendarId);
    } catch (error) {
      setDeleting(false);
      setDeleteErrorTextId(toCalendarErrorTextId(error));
      return;
    }
    await calendars.refreshCalendars();
    navigate("/calendar/calendars");
  };

  const ownerFamilyName =
    calendar.familyId === null
      ? undefined
      : families.find((family) => family.id === calendar.familyId)?.name;

  return (
    <div style={narrowCardPageStyle}>
      <AccountIntro
        icon="calendar_today"
        pillTextId="calendar.heading"
        headingTextId="calendar.calendars.editHeading"
      />
      <CalendarForm
        mode="edit"
        ownerFamilyName={ownerFamilyName}
        initialValues={{ name: calendar.name, color: calendar.color }}
        status={saveStatus}
        errorTextId={saveErrorTextId}
        submitTextId="calendar.actions.save"
        onSubmit={saveCalendar}
        footer={
          <>
            {backLink}
            {!calendar.isDefault && (
              <DeleteCalendarPanel
                deleting={deleting}
                errorTextId={deleteErrorTextId}
                onConfirm={deleteCalendar}
              />
            )}
          </>
        }
      />
    </div>
  );
};
