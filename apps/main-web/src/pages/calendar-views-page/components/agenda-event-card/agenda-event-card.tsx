// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../../../calendars/calendar-accents.js";
import { durationMinutes, formatClockTime } from "../../../../calendar-views/time-format.js";
import { formatDuration } from "../../../../calendar-views/format-duration.js";
import {
  agendaAccentBarStyle,
  agendaCalendarPillStyle,
  agendaCardBodyStyle,
  agendaCardFooterStyle,
  agendaCardHeaderStyle,
  agendaCardStyle,
  agendaClockStyle,
  agendaDurationStyle,
  agendaEndStyle,
  agendaMeridiemStyle,
  agendaRowStyle,
  agendaTimeColumnStyle,
} from "./styles.js";
import type { AgendaEventCardProps } from "./types.js";

export const AgendaEventCard = ({ event, timeZone }: AgendaEventCardProps) => {
  const { t } = useTranslation();
  const accent = calendarAccentColor(event.calendarColor).background;
  const duration = formatDuration(durationMinutes(event.startsAt, event.endsAt), t);

  return (
    <li style={agendaRowStyle} data-testid={`agenda-event-${event.id}`}>
      <div style={agendaTimeColumnStyle}>
        {event.isAllDay ? (
          <Text variant="label" textId="calendar.mobileViews.allDay" />
        ) : (
          <TimeOfDay instant={event.startsAt} timeZone={timeZone} />
        )}
      </div>
      <article style={agendaCardStyle}>
        <span aria-hidden="true" style={agendaAccentBarStyle(accent)} />
        <div style={agendaCardHeaderStyle}>
          <span style={agendaCalendarPillStyle(accent)}>{event.calendarName}</span>
          {!event.isAllDay && <span style={agendaDurationStyle}>{duration}</span>}
        </div>
        <div style={agendaCardBodyStyle}>
          <Text variant="subheading" value={event.title} />
          {event.location !== null && <Text variant="body" value={event.location} />}
        </div>
        {!event.isAllDay && (
          <div style={agendaCardFooterStyle}>
            <span />
            <span style={agendaEndStyle}>
              {t("calendar.mobileViews.end", { time: formatClockTime(event.endsAt, timeZone) })}
            </span>
          </div>
        )}
      </article>
    </li>
  );
};

const TimeOfDay = ({
  instant,
  timeZone,
}: {
  readonly instant: string;
  readonly timeZone: string;
}) => {
  const [clock = "", meridiem = ""] = formatClockTime(instant, timeZone).split(" ");
  return (
    <>
      <span style={agendaClockStyle}>{clock}</span>
      <span style={agendaMeridiemStyle}>{meridiem}</span>
    </>
  );
};
