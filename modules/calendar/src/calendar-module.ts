// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EventBus } from "@offgrid/event-bus";
import { registerDefaultCalendarSubscribers } from "./events/default-calendar/register-default-calendar-subscribers.js";

export const calendarModule = {
  name: "calendar",
  registerSubscribers: (context: { readonly eventBus: EventBus }) =>
    registerDefaultCalendarSubscribers(context.eventBus),
};
