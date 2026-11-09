// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { familyMemberSchema } from "./family-member-schema.js";

export const familyMemberListSchema = z.object({
  members: z.array(familyMemberSchema),
});
