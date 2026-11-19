// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { updateStatusSchema } from "@offgrid/contracts";
import { z } from "zod";

export const updaterStatusReplySchema = z.strictObject({
  update: updateStatusSchema.nullable(),
  running: z.boolean(),
});

export const updaterErrorBodySchema = z.strictObject({
  error: z.string(),
});
