// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { timestampSchema } from "./timestamp-schema.js";
import { userIdSchema } from "./user-id-schema.js";

export const passwordResetIssuedSchema = z.object({
  userId: userIdSchema,
  code: z.string().min(1),
  expiresAt: timestampSchema,
});
