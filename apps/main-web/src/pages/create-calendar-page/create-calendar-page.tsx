// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyIdSchema } from "@offgrid/contracts";
import { Text } from "@offgrid/ui";
import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { createCalendar } from "../../calendars/calendar-api.js";
import {
  toCalendarErrorTextId,
  type CalendarErrorTextId,
} from "../../calendars/to-calendar-error-text-id.js";
import type { CalendarSaveStatus } from "../../calendars/types.js";
import { CalendarForm } from "../../forms/calendar-form/calendar-form.js";
import type { CalendarFormValues } from "../../forms/calendar-form/types.js";
import type { ShellContext } from "../../types.js";
import { AccountIntro } from "../create-account-page/components/account-intro/account-intro.js";
import { narrowCardPageStyle } from "../families-page/styles.js";

export const CreateCalendarPage = () => {
  const { families, calendars } = useOutletContext<ShellContext>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CalendarSaveStatus>("idle");
  const [errorTextId, setErrorTextId] = useState<CalendarErrorTextId | undefined>(undefined);

  const saveCalendar = async ({ name, color, familyId }: CalendarFormValues) => {
    setStatus("submitting");
    setErrorTextId(undefined);
    try {
      await createCalendar(
        familyId === undefined
          ? { name, color }
          : { name, color, familyId: familyIdSchema.parse(familyId) },
      );
    } catch (error) {
      setStatus("failed");
      setErrorTextId(toCalendarErrorTextId(error));
      return;
    }
    await calendars.refreshCalendars();
    navigate("/calendar/calendars");
  };

  return (
    <div style={narrowCardPageStyle}>
      <AccountIntro
        icon="calendar_today"
        pillTextId="calendar.heading"
        headingTextId="calendar.calendars.newHeading"
        bodyTextId="calendar.calendars.newBody"
      />
      <CalendarForm
        mode="create"
        families={families}
        status={status}
        errorTextId={errorTextId}
        submitTextId="calendar.calendars.create"
        onSubmit={saveCalendar}
        footer={
          <Link to="/calendar/calendars" className="og-focusable" data-testid="calendar-back">
            <Text variant="link" textId="calendar.calendars.backToList" />
          </Link>
        }
      />
    </div>
  );
};
