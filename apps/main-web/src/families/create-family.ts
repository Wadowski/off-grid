// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familySchema } from "@offgrid/contracts";
import { webApiClient } from "../api/web-api-client.js";
import type { FamilyAppearance } from "../types.js";

export const createFamily = async (name: string, appearance?: FamilyAppearance) => {
  const body = await webApiClient.request("POST", "/families", { name, ...appearance });
  return familySchema.parse(body);
};
