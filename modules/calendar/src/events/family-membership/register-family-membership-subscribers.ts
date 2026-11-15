// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import type { CalendarSubscriberContext } from "../../types.js";
import { familyMembershipHandler } from "./family-membership-handler.js";

export const registerFamilyMembershipSubscribers = (context: CalendarSubscriberContext): void => {
  context.eventBus.subscribeToEvents({
    name: "calendar-family-membership",
    events: [familyMemberAddedV1, familyMemberRemovedV1],
    runAs: "calendar",
    onFailure: "halt",
    handler: (event) => familyMembershipHandler(context.db, event),
  });
};
