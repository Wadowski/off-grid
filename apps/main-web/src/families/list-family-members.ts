// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyMemberListSchema } from "@offgrid/contracts";
import { webApiClient } from "../api/web-api-client.js";

export const listFamilyMembers = async (familyId: string) => {
  const body = await webApiClient.request("GET", `/families/${familyId}/members`);
  return familyMemberListSchema.parse(body).members;
};
