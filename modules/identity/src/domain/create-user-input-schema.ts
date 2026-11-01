// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { displayNameSchema } from "@offgrid/contracts";
import { z } from "zod";
import { PASSWORD_HASH_PREFIX } from "../constants.js";
import { emailSchema } from "./email-schema.js";

export const createUserInputSchema = z.object({
  email: emailSchema,
  displayName: displayNameSchema,
  passwordHash: z.string().startsWith(PASSWORD_HASH_PREFIX),
  recoveryCodeHash: z.string().min(1),
});
