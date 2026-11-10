// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { webApiClient } from "../api/web-api-client.js";

export const removeFamilyMember = async (familyId: string, userId: string): Promise<void> => {
  await webApiClient.request("DELETE", `/families/${familyId}/members/${userId}`);
};
