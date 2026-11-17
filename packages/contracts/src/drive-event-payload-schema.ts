// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { hasExactlyOneOwner } from "./has-exactly-one-owner.js";
import { uuidSchema } from "./uuid-schema.js";

export const driveEventPayloadSchema = z
  .strictObject({
    driveId: uuidSchema,
    userId: uuidSchema.nullable(),
    familyId: uuidSchema.nullable(),
  })
  .refine(
    (payload) => hasExactlyOneOwner(payload.userId, payload.familyId),
    "Exactly one of userId and familyId must be set.",
  );
