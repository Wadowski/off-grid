// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyInvitationCreatedSchema } from "@offgrid/contracts";
import { webApiClient } from "../api/web-api-client.js";

export const createFamilyInvitation = async (familyId: string) => {
  const body = await webApiClient.request("POST", `/families/${familyId}/invitations`);
  return familyInvitationCreatedSchema.parse(body);
};
