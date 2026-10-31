// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyListSchema } from "@offgrid/contracts";
import { webApiClient } from "../api/web-api-client.js";

export const listFamilies = async () => {
  const body = await webApiClient.request("GET", "/families");
  return familyListSchema.parse(body).families;
};
