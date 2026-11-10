// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { familyIdSchema } from "./family-id-schema.js";

export const selectActiveFamilyRequestSchema = z.object({
  familyId: familyIdSchema,
});
