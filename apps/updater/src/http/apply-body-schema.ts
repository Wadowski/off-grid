// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { RELEASE_VERSION_PATTERN } from "@offgrid/contracts";

export const applyBodySchema = z.strictObject({
  version: z.string().regex(RELEASE_VERSION_PATTERN),
});
