// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { fileVersionSchema } from "./file-version-schema.js";

export const fileVersionListSchema = z.object({
  versions: z.array(fileVersionSchema),
});
