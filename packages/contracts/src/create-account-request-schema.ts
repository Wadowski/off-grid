// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { displayNameSchema } from "./display-name-schema.js";

export const createAccountRequestSchema = z.object({
  displayName: displayNameSchema,
  email: z.email().max(254),
  password: z.string().min(1).max(512),
});
