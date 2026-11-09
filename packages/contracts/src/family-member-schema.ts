// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { familyRoleSchema } from "./family-role-schema.js";
import { timestampSchema } from "./timestamp-schema.js";
import { userIdSchema } from "./user-id-schema.js";

export const familyMemberSchema = z.object({
  userId: userIdSchema,
  role: familyRoleSchema,
  joinedAt: timestampSchema,
});
