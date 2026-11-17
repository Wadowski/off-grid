// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { fileNameSchema } from "./file-name-schema.js";

export const renameFileRequestSchema = z.object({
  name: fileNameSchema,
});
