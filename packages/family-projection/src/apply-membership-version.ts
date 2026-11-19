// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { classifySourceVersion } from "@offgrid/event-bus";
import { MembershipChangeOutOfOrderError } from "./errors/membership-change-out-of-order-error.js";
import type { MembershipChange, MembershipVersionDecision, StoredMembership } from "./types.js";

export const applyMembershipVersion = (
  stored: StoredMembership | null,
  change: MembershipChange,
): MembershipVersionDecision => {
  const outcome = classifySourceVersion(stored?.sourceVersion ?? null, change.sourceVersion);
  if (outcome === "duplicate" || outcome === "stale") {
    return "skip";
  }
  if (outcome === "gap" && stored !== null) {
    throw new MembershipChangeOutOfOrderError();
  }
  return { isMember: outcome === "apply" && change.isMember };
};
