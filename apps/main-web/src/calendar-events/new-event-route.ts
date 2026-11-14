// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarViewKind } from "@offgrid/contracts";
import { DEFAULT_CALENDAR_VIEW, isCalendarViewKind } from "../calendar-views/view-navigation.js";
import type { LocationParts } from "./types.js";

export const NEW_EVENT_PATH = "/calendar/event/new";

export const DEFAULT_EVENT_BACKGROUND = "/calendar/agenda";

const backgroundOf = ({ pathname, search }: LocationParts): string => `${pathname}${search}`;

export const readBackground = (state: unknown): string | undefined => {
  if (typeof state !== "object" || state === null || !("background" in state)) {
    return undefined;
  }
  const background = state.background;
  return typeof background === "string" && background.startsWith("/calendar")
    ? background
    : undefined;
};

export const viewOfBackground = (background: string | undefined): CalendarViewKind => {
  const segment = background?.split("?")[0]?.split("/")[2];
  return isCalendarViewKind(segment) ? segment : DEFAULT_CALENDAR_VIEW;
};

export const newEventTarget = (from: LocationParts) => ({
  to: { pathname: NEW_EVENT_PATH, search: from.search },
  state: { background: backgroundOf(from) },
});
