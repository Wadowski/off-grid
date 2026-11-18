// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import type { FilesSubscriberContext } from "../../types.js";
import { familyMembershipHandler } from "./family-membership-handler.js";

export const registerFamilyMembershipSubscribers = (context: FilesSubscriberContext): void => {
  context.eventBus.subscribeToEvents({
    name: "files-family-membership",
    events: [familyMemberAddedV1, familyMemberRemovedV1],
    runAs: "files",
    onFailure: "halt",
    handler: (event) => familyMembershipHandler(context.db, event),
  });
};
