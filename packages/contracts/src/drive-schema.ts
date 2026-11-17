// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { driveIdSchema } from "./drive-id-schema.js";
import { familyIdSchema } from "./family-id-schema.js";
import { timestampSchema } from "./timestamp-schema.js";

export const driveSchema = z.object({
  id: driveIdSchema,
  familyId: familyIdSchema.nullable(),
  createdAt: timestampSchema,
});
