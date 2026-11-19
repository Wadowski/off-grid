// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { RELEASE_VERSION_PATTERN } from "./constants.js";

export const systemUpdateApplyResultSchema = z.strictObject({
  started: z.literal(true),
  targetVersion: z.string().regex(RELEASE_VERSION_PATTERN),
});
