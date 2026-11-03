// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { displayNameSchema } from "@offgrid/contracts";
import { z } from "zod";
import { PASSWORD_HASH_PATTERN } from "../../constants.js";
import { emailSchema } from "../email/email-schema.js";
import { recoveryCodeHashSchema } from "./recovery-code-hash-schema.js";

export const createUserInputSchema = z.object({
  email: emailSchema,
  displayName: displayNameSchema,
  passwordHash: z.string().regex(PASSWORD_HASH_PATTERN),
  recoveryCodeHash: recoveryCodeHashSchema,
});
