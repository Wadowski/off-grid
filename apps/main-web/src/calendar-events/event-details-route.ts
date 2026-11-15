// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { backgroundOf } from "./new-event-route.js";
import type { EventDetailsTarget, LocationParts } from "./types.js";

export const eventDetailsTarget = (from: LocationParts, eventId: string): EventDetailsTarget => ({
  to: { pathname: `/calendar/event/${encodeURIComponent(eventId)}`, search: "" },
  state: { background: backgroundOf(from) },
});
