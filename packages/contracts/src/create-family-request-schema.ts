// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { familyNameSchema } from "./family-name-schema.js";

export const createFamilyRequestSchema = z.object({
  name: familyNameSchema,
});
