// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import type { RelationsSubscriberContext } from "../../types.js";
import { FAMILY_MEMBERSHIP_SUBSCRIBER } from "../../constants.js";
import { familyMembershipHandler } from "./family-membership-handler.js";

export const registerFamilyMembershipSubscribers = (context: RelationsSubscriberContext): void => {
  context.eventBus.subscribeToEvents({
    name: FAMILY_MEMBERSHIP_SUBSCRIBER,
    events: [familyMemberAddedV1, familyMemberRemovedV1],
    runAs: "relations",
    onFailure: "halt",
    handler: (event) => familyMembershipHandler(context.db, event),
  });
};
