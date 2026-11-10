// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { webApiClient } from "../api/web-api-client.js";

export const revokeFamilyInvitation = async (
  familyId: string,
  invitationId: string,
): Promise<void> => {
  await webApiClient.request("DELETE", `/families/${familyId}/invitations/${invitationId}`);
};
