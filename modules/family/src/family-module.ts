// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EventBus } from "@offgrid/event-bus";
import { registerFamilyRoutes } from "./http/register-family-routes.js";
import { registerAccountNameSubscribers } from "./events/account-names/register-account-name-subscribers.js";

export const familyModule = {
  name: "family",
  registerRoutes: registerFamilyRoutes,
  registerSubscribers: (context: { readonly eventBus: EventBus }) =>
    registerAccountNameSubscribers(context.eventBus),
};
