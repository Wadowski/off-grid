// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { EventBus } from "@offgrid/event-bus";
import { registerFamilyRoutes } from "./http/register-family-routes.js";
import {
  userCreatedProfile,
  userDisplayNameProfile,
} from "./projections/user-profile-subscriptions.js";

export const familyModule = {
  name: "family",
  registerRoutes: registerFamilyRoutes,
  registerSubscribers: (context: { readonly eventBus: EventBus }) => {
    context.eventBus.subscribe(userCreatedProfile);
    context.eventBus.subscribe(userDisplayNameProfile);
  },
};
