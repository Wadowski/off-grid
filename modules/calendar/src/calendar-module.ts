// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EventBus } from "@offgrid/event-bus";
import { registerDefaultCalendarSubscribers } from "./events/default-calendar/register-default-calendar-subscribers.js";
import { registerFamilyMembershipSubscribers } from "./events/family-membership/register-family-membership-subscribers.js";
import { registerCalendarRoutes } from "./http/register-calendar-routes.js";

export const calendarModule = {
  name: "calendar",
  registerRoutes: registerCalendarRoutes,
  registerSubscribers: (context: { readonly eventBus: EventBus }) => {
    registerDefaultCalendarSubscribers(context.eventBus);
    registerFamilyMembershipSubscribers(context.eventBus);
  },
};
