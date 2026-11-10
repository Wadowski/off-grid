// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { displayNameSchema } from "./display-name-schema.js";
import { familyRoleSchema } from "./family-role-schema.js";
import { timestampSchema } from "./timestamp-schema.js";
import { userIdSchema } from "./user-id-schema.js";

export const familyMemberSchema = z.object({
  userId: userIdSchema,
  displayName: displayNameSchema.nullable(),
  role: familyRoleSchema,
  joinedAt: timestampSchema,
});
