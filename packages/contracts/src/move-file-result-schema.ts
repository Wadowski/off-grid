// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { fileSchema } from "./file-schema.js";

export const moveFileResultSchema = z.object({
  file: fileSchema,
  crossOwnerNotice: z.boolean(),
});
