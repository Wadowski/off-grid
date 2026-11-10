// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { joinedFamilySchema } from "@offgrid/contracts";
import { webApiClient } from "../api/web-api-client.js";

export const joinFamily = async (code: string) => {
  const body = await webApiClient.request("POST", "/families/join", { code });
  return joinedFamilySchema.parse(body);
};
