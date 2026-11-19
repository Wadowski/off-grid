// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMembershipSubscriptionOf } from "@offgrid/family-projection";
import type { FilesSubscriberContext } from "../../types.js";
import { familyMembershipHandler } from "./family-membership-handler.js";

export const registerFamilyMembershipSubscribers = (context: FilesSubscriberContext): void => {
  context.eventBus.subscribeToEvents({
    ...familyMembershipSubscriptionOf("files"),
    handler: (event) => familyMembershipHandler(context.db, event),
  });
};
