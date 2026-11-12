// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import type { EventBus } from "@offgrid/event-bus";
import { applyFamilyMembership } from "./apply-family-membership.js";

const requireFamilyId = (familyId: string | null): string => {
  if (familyId === null) {
    throw new Error("family membership event has no family");
  }
  return familyId;
};

export const registerFamilyMembershipSubscribers = (eventBus: EventBus): void => {
  eventBus.subscribeToEvents({
    name: "calendar-family-membership",
    events: [familyMemberAddedV1, familyMemberRemovedV1],
    runAs: "calendar",
    onFailure: "halt",
    handler: (event, { tx }) =>
      applyFamilyMembership(tx, {
        familyId: requireFamilyId(event.familyId),
        userId: event.payload.userId,
        sourceVersion: event.sourceVersion,
        isMember: event.type === familyMemberAddedV1.name,
      }),
  });
};
