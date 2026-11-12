// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyIdSchema } from "@offgrid/contracts";
import { Text } from "@offgrid/ui";
import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { createCalendar } from "../../calendars/calendar-api.js";
import type { CalendarSaveStatus } from "../../calendars/types.js";
import { CalendarForm } from "../../forms/calendar-form/calendar-form.js";
import type { CalendarFormValues } from "../../forms/calendar-form/types.js";
import type { ShellContext } from "../../types.js";
import { AccountIntro } from "../create-account-page/components/account-intro/account-intro.js";
import { calendarCardPageStyle } from "../../calendars/styles.js";

export const CreateCalendarPage = () => {
  const { families, calendars } = useOutletContext<ShellContext>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CalendarSaveStatus>("idle");

  const saveCalendar = async ({ name, color, familyId }: CalendarFormValues) => {
    setStatus("submitting");
    try {
      await createCalendar(
        familyId === undefined
          ? { name, color }
          : { name, color, familyId: familyIdSchema.parse(familyId) },
      );
    } catch {
      setStatus("failed");
      return;
    }
    await calendars.refreshCalendars();
    navigate("/calendar");
  };

  return (
    <div style={calendarCardPageStyle}>
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
        submitTextId="calendar.calendars.create"
        onSubmit={saveCalendar}
        footer={
          <Link to="/calendar" className="og-focusable" data-testid="calendar-back">
            <Text variant="link" textId="calendar.calendars.backToList" />
          </Link>
        }
      />
    </div>
  );
};
