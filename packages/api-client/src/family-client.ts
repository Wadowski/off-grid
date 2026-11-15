// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyListSchema, familyMemberListSchema } from "@offgrid/contracts";
import type { ApiClient } from "./types.js";

export const createFamilyClient = (client: ApiClient) => ({
  listFamilies: async () =>
    familyListSchema.parse(await client.request("GET", "/families")).families,

  listFamilyMembers: async (familyId: string) =>
    familyMemberListSchema.parse(
      await client.request("GET", `/families/${encodeURIComponent(familyId)}/members`),
    ).members,
});
