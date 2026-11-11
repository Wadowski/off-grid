// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import type { EventBus } from "@offgrid/event-bus";
import { addFamilyMembership, removeFamilyMembership } from "./apply-family-membership.js";

const requireFamilyId = (familyId: string | null): string => {
  if (familyId === null) {
    throw new Error("family membership event has no family");
  }
  return familyId;
};

export const registerFamilyMembershipSubscribers = (eventBus: EventBus): void => {
  eventBus.subscribe({
    name: "calendar-family-membership-from-member-added",
    event: familyMemberAddedV1,
    runAs: "calendar",
    handler: (event, { tx }) =>
      addFamilyMembership(tx, {
        familyId: requireFamilyId(event.familyId),
        userId: event.payload.userId,
      }),
  });
  eventBus.subscribe({
    name: "calendar-family-membership-from-member-removed",
    event: familyMemberRemovedV1,
    runAs: "calendar",
    handler: (event, { tx }) =>
      removeFamilyMembership(tx, {
        familyId: requireFamilyId(event.familyId),
        userId: event.payload.userId,
      }),
  });
};
