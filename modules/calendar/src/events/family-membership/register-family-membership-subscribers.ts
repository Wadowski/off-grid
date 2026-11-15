// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import type { EventOf } from "@offgrid/event-bus";
import { FamilyMembershipWithoutFamilyError } from "../../application/errors/family-membership-without-family-error.js";
import type { CalendarSubscriberContext } from "../../types.js";
import { applyFamilyMembership } from "./apply-family-membership.js";

const requireFamilyId = (familyId: string | null): string => {
  if (familyId === null) {
    throw new FamilyMembershipWithoutFamilyError();
  }
  return familyId;
};

export const familyMembershipHandler =
  (db: CalendarSubscriberContext["db"]) =>
  (event: EventOf<typeof familyMemberAddedV1> | EventOf<typeof familyMemberRemovedV1>) =>
    db.$transaction((tx) =>
      applyFamilyMembership(tx, {
        familyId: requireFamilyId(event.familyId),
        userId: event.payload.userId,
        sourceVersion: event.sourceVersion,
        isMember: event.type === familyMemberAddedV1.name,
      }),
    );

export const registerFamilyMembershipSubscribers = (context: CalendarSubscriberContext): void => {
  context.eventBus.subscribeToEvents({
    name: "calendar-family-membership",
    events: [familyMemberAddedV1, familyMemberRemovedV1],
    runAs: "calendar",
    onFailure: "halt",
    handler: familyMembershipHandler(context.db),
  });
};
