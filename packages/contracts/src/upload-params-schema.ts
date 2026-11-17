// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { uploadIdSchema } from "./upload-id-schema.js";

export const uploadParamsSchema = z.object({
  id: uploadIdSchema,
});
