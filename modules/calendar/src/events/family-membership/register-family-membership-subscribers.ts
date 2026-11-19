// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMembershipSubscriptionOf } from "@offgrid/family-projection";
import type { CalendarSubscriberContext } from "../../types.js";
import { familyMembershipHandler } from "./family-membership-handler.js";

export const registerFamilyMembershipSubscribers = (context: CalendarSubscriberContext): void => {
  context.eventBus.subscribeToEvents({
    ...familyMembershipSubscriptionOf("calendar"),
    handler: (event) => familyMembershipHandler(context.db, event),
  });
};
