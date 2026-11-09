// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { defineEvent } from "./define-event.js";
import { familyRoleSchema } from "./family-role-schema.js";
import { userIdSchema } from "./user-id-schema.js";

export const familyMemberUpdatedV1 = defineEvent({
  name: "family-member-updated-v1",
  version: 1,
  schema: z.object({
    userId: userIdSchema,
    role: familyRoleSchema,
  }),
});
