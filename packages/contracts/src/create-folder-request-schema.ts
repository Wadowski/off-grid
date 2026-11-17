// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { fileIdSchema } from "./file-id-schema.js";
import { fileNameSchema } from "./file-name-schema.js";

export const createFolderRequestSchema = z.object({
  parentId: fileIdSchema.nullable(),
  name: fileNameSchema,
});
