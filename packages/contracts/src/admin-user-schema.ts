// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { displayNameSchema } from "./display-name-schema.js";
import { timestampSchema } from "./timestamp-schema.js";
import { userIdSchema } from "./user-id-schema.js";

export const adminUserSchema = z.object({
  id: userIdSchema,
  email: z.string(),
  displayName: displayNameSchema,
  instanceRole: z.enum(["admin", "user"]),
  status: z.enum(["active", "disabled"]),
  createdAt: timestampSchema,
});
