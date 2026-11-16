// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { formatDuration } from "../../../calendar-views/format-duration.js";
import {
  durationMinutes,
  formatClockRange,
  formatDayHeading,
  zonedMomentOf,
} from "../../../calendar-views/time-format.js";
import { MaterialIcon } from "../../../icons/material-icon/material-icon.js";
import { GuestReminders } from "../components/guest-reminders/guest-reminders.js";
import {
  detailsBodyStyle,
  detailsCardStyle,
  detailsNotesStyle,
  detailsRowStyle,
} from "./styles.js";
import type { EventDetailsBodyProps } from "./types.js";

export const EventDetailsBody = ({ event, timeZone, onSaveReminders }: EventDetailsBodyProps) => {
  const { t } = useTranslation();
  const dateLine = event.isAllDay
    ? formatDayHeading(event.startDate ?? "")
    : formatDayHeading(zonedMomentOf(event.startsAt, timeZone).date);
  const timeLine = event.isAllDay
    ? t("calendar.mobileViews.allDay")
    : `${formatClockRange(event.startsAt, event.endsAt, timeZone)} · ${formatDuration(
        durationMinutes(event.startsAt, event.endsAt),
        t,
      )}`;

  return (
    <div style={detailsBodyStyle}>
      <Text variant="heading" value={event.title} />
      <div style={detailsCardStyle}>
        <div style={detailsRowStyle}>
          <MaterialIcon name="calendar_month" size="18px" color={cssVar("color-primary")} />
          <Text variant="subheading" value={dateLine} />
        </div>
        <div style={detailsRowStyle}>
          <Text variant="body" value={timeLine} />
        </div>
      </div>
      {event.location !== null && (
        <div style={detailsCardStyle}>
          <div style={detailsRowStyle}>
            <MaterialIcon name="location_on" size="18px" color={cssVar("color-primary")} />
            <Text variant="body" value={event.location} />
          </div>
        </div>
      )}
      {event.description !== null && (
        <div style={detailsCardStyle}>
          <Text variant="label" textId="calendar.eventDetails.notes" />
          <div style={detailsNotesStyle}>
            <Text variant="body" value={event.description} />
          </div>
        </div>
      )}
      {event.readOnly && (
        <div role="note" style={detailsCardStyle}>
          <Text variant="body" textId="calendar.eventDetails.readOnly" />
        </div>
      )}
      {event.readOnly && (
        <GuestReminders
          key={event.id}
          offsets={event.reminderOffsetsMinutes ?? []}
          onSave={onSaveReminders}
        />
      )}
    </div>
  );
};
