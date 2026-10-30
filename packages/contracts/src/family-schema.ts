// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { familyIdSchema } from "./family-id-schema.js";
import { familyNameSchema } from "./family-name-schema.js";
import { timestampSchema } from "./timestamp-schema.js";

export const familySchema = z.object({
  id: familyIdSchema,
  name: familyNameSchema,
  createdAt: timestampSchema,
});
