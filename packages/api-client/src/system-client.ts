// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  systemRoutes,
  systemUpdateApplyResultSchema,
  systemUpdateCheckSchema,
  systemUpdateNightlySchema,
  systemUpdateSchema,
  systemVersionSchema,
} from "@offgrid/contracts";
import type { ApiClient } from "./types.js";

export const createSystemClient = (client: ApiClient) => ({
  version: async () => systemVersionSchema.parse(await client.request("GET", systemRoutes.version)),

  update: async () => systemUpdateSchema.parse(await client.request("GET", systemRoutes.update)),

  checkForUpdate: async () =>
    systemUpdateCheckSchema.parse(await client.request("POST", systemRoutes.updateCheck)),

  applyUpdate: async () =>
    systemUpdateApplyResultSchema.parse(await client.request("POST", systemRoutes.updateApply)),

  setNightlyUpdate: async (enabled: boolean) =>
    systemUpdateNightlySchema.parse(
      await client.request("PUT", systemRoutes.updateNightly, systemUpdateNightlySchema.parse({ enabled })),
    ),
});
