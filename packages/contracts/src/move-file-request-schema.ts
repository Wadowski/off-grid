// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { driveIdSchema } from "./drive-id-schema.js";
import { fileIdSchema } from "./file-id-schema.js";

export const moveFileRequestSchema = z.object({
  driveId: driveIdSchema,
  parentId: fileIdSchema.nullable(),
});
