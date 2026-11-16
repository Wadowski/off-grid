// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { uuidSchema } from "./uuid-schema.js";
import { timestampSchema } from "./timestamp-schema.js";
import { familyIdSchema } from "./family-id-schema.js";

export const envelopeFields = z.object({
  id: uuidSchema,
  type: z.string(),
  version: z.number().int().min(1),
  occurredAt: timestampSchema,
  traceId: z.string().min(1).max(128),
  familyId: familyIdSchema.nullable(),
  sourceVersion: z.number().int().min(1),
});
