// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { systemRoutes, systemVersionSchema } from "@offgrid/contracts";
import type { ApiClient } from "./types.js";

export const createSystemClient = (client: ApiClient) => ({
  version: async () => systemVersionSchema.parse(await client.request("GET", systemRoutes.version)),
});
