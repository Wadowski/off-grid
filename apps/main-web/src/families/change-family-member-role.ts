// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberSchema } from "@offgrid/contracts";
import { webApiClient } from "../api/web-api-client.js";
import type { CurrentUserRole } from "../types.js";

export const changeFamilyMemberRole = async (
  familyId: string,
  userId: string,
  role: CurrentUserRole,
) => {
  const body = await webApiClient.request("PATCH", `/families/${familyId}/members/${userId}`, {
    role,
  });
  return familyMemberSchema.parse(body);
};
