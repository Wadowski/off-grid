// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { byteSizeSchema } from "./byte-size-schema.js";
import { mimeTypeSchema } from "./mime-type-schema.js";
import { driveIdSchema } from "./drive-id-schema.js";
import { fileIdSchema } from "./file-id-schema.js";
import { fileNameSchema } from "./file-name-schema.js";
import { fileVersionIdSchema } from "./file-version-id-schema.js";
import { timestampSchema } from "./timestamp-schema.js";

const fileEntryBase = {
  id: fileIdSchema,
  driveId: driveIdSchema,
  parentId: fileIdSchema.nullable(),
  name: fileNameSchema,
  version: z.number().int().min(1),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  deletedAt: timestampSchema.nullable(),
};

const folderSchema = z.object({
  ...fileEntryBase,
  isFolder: z.literal(true),
});

const regularFileSchema = z.object({
  ...fileEntryBase,
  isFolder: z.literal(false),
  mimeType: mimeTypeSchema,
  size: byteSizeSchema,
  currentVersionId: fileVersionIdSchema,
});

export const fileSchema = z.discriminatedUnion("isFolder", [folderSchema, regularFileSchema]);
