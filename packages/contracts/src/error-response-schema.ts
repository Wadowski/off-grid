// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { errorCodeSchema } from "./error-code-schema.js";

export const errorResponseSchema = z.object({
  code: errorCodeSchema,
  message: z.string().min(1).max(500),
});
