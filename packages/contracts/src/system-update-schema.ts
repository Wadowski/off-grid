// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { RELEASE_VERSION_PATTERN, UPDATE_RUN_STATES } from "./constants.js";
import { updateStatusSchema } from "./system-update-status-schema.js";

export const systemUpdateSchema = z.strictObject({
  currentVersion: z.string().min(1),
  latestVersion: z.string().regex(RELEASE_VERSION_PATTERN).nullable(),
  updateAvailable: z.boolean(),
  updateAllowed: z.boolean(),
  checkedAt: z.iso.datetime().nullable(),
  runState: z.enum(UPDATE_RUN_STATES),
  lastRun: updateStatusSchema.nullable(),
  running: z.boolean(),
  nightlyEnabled: z.boolean(),
});
