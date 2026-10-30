// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { defineEvent } from "./events.js";
import { familyIdSchema, timestampSchema, userIdSchema } from "./primitives.js";

export const familyNameSchema = z.string().trim().min(1).max(100);

export const familyCreatedV1 = defineEvent({
  name: "family-created-v1",
  version: 1,
  schema: z.object({
    name: familyNameSchema,
    creatorUserId: userIdSchema,
  }),
});

export const createFamilyRequestSchema = z.object({
  name: familyNameSchema,
});

export const familySchema = z.object({
  id: familyIdSchema,
  name: familyNameSchema,
  createdAt: timestampSchema,
});

export const familyParamsSchema = z.object({
  id: familyIdSchema,
});

export const familySummarySchema = z.object({
  id: familyIdSchema,
  name: familyNameSchema,
});

export const familyListSchema = z.object({
  families: z.array(familySummarySchema),
});
