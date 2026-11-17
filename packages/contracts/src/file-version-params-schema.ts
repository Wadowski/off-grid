// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { fileIdSchema } from "./file-id-schema.js";
import { fileVersionIdSchema } from "./file-version-id-schema.js";

export const fileVersionParamsSchema = z.object({
  id: fileIdSchema,
  versionId: fileVersionIdSchema,
});
