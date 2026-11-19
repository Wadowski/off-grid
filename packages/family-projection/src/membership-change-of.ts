// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import { requireFamilyId } from "./require-family-id.js";
import type { FamilyMembershipEvent, MembershipChange } from "./types.js";

export const membershipChangeOf = (event: FamilyMembershipEvent): MembershipChange => {
  const change = {
    familyId: requireFamilyId(event.familyId),
    userId: event.payload.userId,
    sourceVersion: event.sourceVersion,
  };
  switch (event.type) {
    case familyMemberAddedV1.name:
      return { ...change, isMember: true };
    case familyMemberRemovedV1.name:
      return { ...change, isMember: false };
  }
};
