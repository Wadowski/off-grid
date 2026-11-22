// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { MAX_MEDIA_TYPE_LENGTH, MEDIA_TYPE_PATTERN } from "../../constants.js";

export const declaredMediaTypeSchema = z
  .string()
  .max(MAX_MEDIA_TYPE_LENGTH)
  .transform((value) => value.split(";")[0]?.trim().toLowerCase() ?? "")
  .pipe(z.string().regex(MEDIA_TYPE_PATTERN));
