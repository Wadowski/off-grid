// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { EventOf } from "@offgrid/event-bus";
import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import { applyFamilyMembership } from "./apply-family-membership.js";
import { requireFamilyId } from "./require-family-id.js";

export const familyMembershipHandler = (
  db: ModuleDatabase,
  event: EventOf<typeof familyMemberAddedV1> | EventOf<typeof familyMemberRemovedV1>,
): Promise<void> =>
  db.$transaction(async (tx) => {
    const familyId = requireFamilyId(event.familyId);
    await applyFamilyMembership(tx, {
      familyId,
      userId: event.payload.userId,
      sourceVersion: event.sourceVersion,
      isMember: event.type === familyMemberAddedV1.name,
    });
  });
