// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyInvitationPreviewSchema } from "@offgrid/contracts";
import { webApiClient } from "../api/web-api-client.js";

export const previewFamilyInvitation = async (code: string) => {
  const body = await webApiClient.request("POST", "/families/invitations/preview", { code });
  return familyInvitationPreviewSchema.parse(body);
};
