// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import type { EventOf } from "@offgrid/event-bus";
import type { CalendarSubscriberContext } from "../../types.js";
import { applyFamilyMembership } from "./apply-family-membership.js";
import { requireFamilyId } from "./require-family-id.js";

export const familyMembershipHandler = (
  db: CalendarSubscriberContext["db"],
  event: EventOf<typeof familyMemberAddedV1> | EventOf<typeof familyMemberRemovedV1>,
) =>
  db.$transaction((tx) =>
    applyFamilyMembership(tx, {
      familyId: requireFamilyId(event.familyId),
      userId: event.payload.userId,
      sourceVersion: event.sourceVersion,
      isMember: event.type === familyMemberAddedV1.name,
    }),
  );
