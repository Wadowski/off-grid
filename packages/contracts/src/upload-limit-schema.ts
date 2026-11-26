// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { byteSizeSchema } from "./byte-size-schema.js";

export const uploadLimitSchema = z.object({
  maxUploadBytes: byteSizeSchema,
});
