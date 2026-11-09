// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { accessGroupIdSchema, familyIdSchema, userIdSchema } from "@offgrid/contracts";
import type { RequestContext } from "../types.js";

export const signedInContext = (
  userId: string,
  sessionId: string,
  familyId: string | null,
): RequestContext => {
  const personalGroupIds = [accessGroupIdSchema.parse(userId)];
  if (familyId === null) {
    return {
      userId: userIdSchema.parse(userId),
      sessionId,
      familyId: null,
      accessGroupIds: personalGroupIds,
    };
  }
  return {
    userId: userIdSchema.parse(userId),
    sessionId,
    familyId: familyIdSchema.parse(familyId),
    accessGroupIds: [...personalGroupIds, accessGroupIdSchema.parse(familyId)],
  };
};
