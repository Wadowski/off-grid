// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { timestampSchema } from "./timestamp-schema.js";

export const sessionAccessSchema = z.object({
  accessToken: z.string().min(1),
  accessExpiresAt: timestampSchema,
});
