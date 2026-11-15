// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { LocationParts } from "./types.js";
import { backgroundOf } from "./new-event-route.js";

export const EVENT_DETAILS_ROUTE = "event/:eventId";

export const eventDetailsPathFor = (eventId: string): string =>
  `/calendar/event/${encodeURIComponent(eventId)}`;

export const eventDetailsTarget = (from: LocationParts, eventId: string) => ({
  to: { pathname: eventDetailsPathFor(eventId), search: "" },
  state: { background: backgroundOf(from) },
});
