// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { addDays, localMidnight } from "../../domain/all-day-bounds.js";
import type { CalendarViewEventView } from "./calendar-view-event-view.js";

export interface ViewDay {
  readonly date: string;
  readonly events: CalendarViewEventView[];
}

const datesBetween = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    dates.push(date);
  }
  return dates;
};

export const buildViewDays = (input: {
  readonly startDate: string;
  readonly endDate: string;
  readonly timeZone: string;
  readonly events: readonly CalendarViewEventView[];
}): ViewDay[] =>
  datesBetween(input.startDate, input.endDate).map((date) => {
    const dayStart = localMidnight(date, input.timeZone).getTime();
    const dayEnd = localMidnight(addDays(date, 1), input.timeZone).getTime();
    return {
      date,
      events: input.events.filter(
        (event) =>
          event.startsAt.getTime() < dayEnd &&
          (event.endsAt.getTime() > dayStart || event.startsAt.getTime() >= dayStart),
      ),
    };
  });
