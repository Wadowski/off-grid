// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { familyRoleSchema } from "./family-role-schema.js";

export const changeFamilyMemberRoleRequestSchema = z.object({
  role: familyRoleSchema,
});
