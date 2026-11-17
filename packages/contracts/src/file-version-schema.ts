// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { byteSizeSchema } from "./byte-size-schema.js";
import { mimeTypeSchema } from "./mime-type-schema.js";
import { fileIdSchema } from "./file-id-schema.js";
import { fileVersionIdSchema } from "./file-version-id-schema.js";
import { timestampSchema } from "./timestamp-schema.js";
import { userIdSchema } from "./user-id-schema.js";

export const fileVersionSchema = z.object({
  id: fileVersionIdSchema,
  fileId: fileIdSchema,
  number: z.number().int().min(1),
  size: byteSizeSchema,
  mimeType: mimeTypeSchema,
  createdByUserId: userIdSchema,
  createdAt: timestampSchema,
});
