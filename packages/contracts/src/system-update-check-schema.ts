// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { RELEASE_VERSION_PATTERN } from "./constants.js";

export const updaterCheckSchema = z.strictObject({
  currentVersion: z.string().regex(RELEASE_VERSION_PATTERN),
  latestVersion: z.string().regex(RELEASE_VERSION_PATTERN),
  updateAvailable: z.boolean(),
  updateAllowed: z.boolean(),
});

export const systemUpdateCheckSchema = updaterCheckSchema.extend({
  checkedAt: z.iso.datetime(),
});
