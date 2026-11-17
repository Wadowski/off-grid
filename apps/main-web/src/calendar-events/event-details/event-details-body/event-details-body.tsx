// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, MaterialIcon, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { formatDuration } from "../../../calendar-views/format-duration.js";
import {
  durationMinutes,
  formatClockRange,
  formatDayHeading,
  zonedMomentOf,
} from "../../../calendar-views/time-format.js";
import { useCalendars } from "../../../calendars/use-calendars.js";
import { FamilyMembersSection } from "../../guests/family-members-section/family-members-section.js";
import { guestNameOf } from "../../guests/guest-names.js";
import { GuestsSection } from "../../guests/guests-section/guests-section.js";
import { useEventGuests } from "../../guests/use-event-guests.js";
import { useGuestCandidates } from "../../guests/use-guest-candidates.js";
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
  const guests = useEventGuests(event.id);
  const candidates = useGuestCandidates();
  const calendarsState = useCalendars(true);
  const familyId =
    calendarsState.calendars.find((calendar) => calendar.id === event.calendarId)?.familyId ?? null;
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
      {calendarsState.listStatus === "loading" && (
        <div style={detailsCardStyle}>
          <Text variant="body" textId="calendar.guests.loading" />
        </div>
      )}
      {calendarsState.listStatus !== "loading" && familyId === null && (
        <GuestsSection
          state={guests}
          readOnly={event.readOnly}
          nameOf={(userId) => guestNameOf(candidates.candidates, userId)}
        />
      )}
      {calendarsState.listStatus !== "loading" && familyId !== null && (
        <FamilyMembersSection state={candidates} familyId={familyId} />
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
