// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { fileIdSchema } from "./file-id-schema.js";

export const fileParamsSchema = z.object({
  id: fileIdSchema,
});
