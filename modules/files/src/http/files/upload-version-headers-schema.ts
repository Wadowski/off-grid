// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { contentLengthSchema } from "./content-length-schema.js";
import { declaredMediaTypeSchema } from "./declared-media-type-schema.js";

export const uploadVersionHeadersSchema = z
  .object({
    "content-type": declaredMediaTypeSchema.optional(),
    "content-length": contentLengthSchema.optional(),
  })
  .transform((headers) => ({
    declaredMimeType: headers["content-type"] ?? null,
    declaredLength: headers["content-length"] ?? null,
  }));
