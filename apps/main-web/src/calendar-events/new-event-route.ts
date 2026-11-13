// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarViewKind } from "@offgrid/contracts";
import { DEFAULT_CALENDAR_VIEW, isCalendarViewKind } from "../calendar-views/view-navigation.js";

export const NEW_EVENT_PATH = "/calendar/event/new";

// Where the modal goes when it closes and no calendar screen was open before it (a deep link).
export const DEFAULT_EVENT_BACKGROUND = "/calendar/agenda";

type LocationParts = { readonly pathname: string; readonly search: string };

// The address of the calendar screen the modal opens over: its path and search, as one string.
export const backgroundOf = ({ pathname, search }: LocationParts): string => `${pathname}${search}`;

// The background a modal was opened over, read from the navigation state. Undefined for a deep link.
export const readBackground = (state: unknown): string | undefined => {
  if (typeof state !== "object" || state === null || !("background" in state)) {
    return undefined;
  }
  const background = state.background;
  return typeof background === "string" && background.startsWith("/calendar")
    ? background
    : undefined;
};

// The calendar view named in a background address, such as "/calendar/day?date=2026-11-16".
export const viewOfBackground = (background: string | undefined): CalendarViewKind => {
  const segment = background?.split("?")[0]?.split("/")[2];
  return isCalendarViewKind(segment) ? segment : DEFAULT_CALENDAR_VIEW;
};

// The target of the modal's address: same search as the screen it opens over, with the background in the state.
export const newEventTarget = (from: LocationParts) => ({
  to: { pathname: NEW_EVENT_PATH, search: from.search },
  state: { background: backgroundOf(from) },
});
