// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { byteSizeSchema } from "./byte-size-schema.js";
import { mimeTypeSchema } from "./mime-type-schema.js";
import { driveIdSchema } from "./drive-id-schema.js";
import { fileIdSchema } from "./file-id-schema.js";
import { fileNameSchema } from "./file-name-schema.js";

export const createUploadRequestSchema = z.object({
  driveId: driveIdSchema,
  parentId: fileIdSchema.nullable(),
  name: fileNameSchema,
  mimeType: mimeTypeSchema,
  size: byteSizeSchema,
  fileId: fileIdSchema.optional(),
});
