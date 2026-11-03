// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { timestampSchema } from "./timestamp-schema.js";
import { uuidSchema } from "./uuid-schema.js";

export const sessionSchema = z.object({
  id: uuidSchema,
  deviceLabel: z.string().nullable(),
  createdAt: timestampSchema,
  lastUsedAt: timestampSchema,
  current: z.boolean(),
});

export const sessionListSchema = z.object({
  sessions: z.array(sessionSchema),
});
