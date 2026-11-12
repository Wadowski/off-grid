// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { sortByStart, splitAllDay } from "../../../../calendar-views/events-by-calendar.js";
import { AgendaEventCard } from "../agenda-event-card/agenda-event-card.js";
import { agendaListStyle } from "./styles.js";
import type { AgendaListProps } from "./types.js";

export const AgendaList = ({ events, timeZone }: AgendaListProps) => {
  const { t } = useTranslation();

  if (events.length === 0) {
    return <Text variant="body" textId="calendar.mobileViews.nothingScheduled" />;
  }

  const { allDay, timed } = splitAllDay(events);
  const ordered = [...allDay, ...sortByStart(timed)];

  return (
    <ul style={agendaListStyle} aria-label={t("calendar.mobileViews.agendaListLabel")}>
      {ordered.map((event) => (
        <AgendaEventCard key={event.id} event={event} timeZone={timeZone} />
      ))}
    </ul>
  );
};
