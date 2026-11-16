// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import type { SharedClusterConnection } from "./types.js";

export const connectionFileSchema: z.ZodType<SharedClusterConnection> = z.object({
  host: z.string().min(1),
  port: z.number().int().positive(),
  maintenanceDatabase: z.string().min(1),
  adminUser: z.string().min(1),
  adminPassword: z.string().min(1),
  appPassword: z.string().min(1),
  migratorPassword: z.string().min(1),
});
