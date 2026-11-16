// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { registerCalendarEventSubscribers } from "./events/calendar-events/register-calendar-event-subscribers.js";
import { registerEventGuestSubscribers } from "./events/event-guests/register-event-guest-subscribers.js";
import { registerFamilyMembershipSubscribers } from "./events/family-membership/register-family-membership-subscribers.js";
import type { FastifyInstance } from "fastify";
import { registerRelationsRoutes } from "./http/register-relations-routes.js";
import type { RelationsRouteContext, RelationsSubscriberContext } from "./types.js";

export const relationsModule = {
  name: "relations",
  registerRoutes: (api: FastifyInstance, context: RelationsRouteContext) =>
    registerRelationsRoutes(api, context),
  registerSubscribers: (context: RelationsSubscriberContext) => {
    registerCalendarEventSubscribers(context);
    registerEventGuestSubscribers(context);
    registerFamilyMembershipSubscribers(context);
  },
};
