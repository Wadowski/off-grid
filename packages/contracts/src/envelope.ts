// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { familyIdSchema, timestampSchema, uuidSchema } from "./primitives.js";

const envelopeFields = z.object({
  id: uuidSchema,
  type: z.string(),
  version: z.number().int().min(1),
  occurredAt: timestampSchema,
  traceId: z.string().min(1).max(128),
  familyId: familyIdSchema.nullable(),
  sourceVersion: z.number().int().min(1),
});

export function eventEnvelopeSchema<
  Name extends string,
  Version extends number,
  Payload extends z.ZodType,
>(name: Name, version: Version, payload: Payload) {
  return envelopeFields.extend({
    type: z.literal(name),
    version: z.literal(version),
    payload,
  });
}
