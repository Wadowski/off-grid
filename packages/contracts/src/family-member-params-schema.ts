// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { familyIdSchema } from "./family-id-schema.js";
import { userIdSchema } from "./user-id-schema.js";

export const familyMemberParamsSchema = z.object({
  id: familyIdSchema,
  userId: userIdSchema,
});
