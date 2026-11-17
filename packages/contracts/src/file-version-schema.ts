// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { fileIdSchema } from "./file-id-schema.js";
import { fileVersionIdSchema } from "./file-version-id-schema.js";
import { timestampSchema } from "./timestamp-schema.js";
import { userIdSchema } from "./user-id-schema.js";

export const fileVersionSchema = z.object({
  id: fileVersionIdSchema,
  fileId: fileIdSchema,
  number: z.number().int().min(1),
  size: z.number().int().min(0),
  mimeType: z.string().min(1).max(255),
  createdByUserId: userIdSchema,
  createdAt: timestampSchema,
});
