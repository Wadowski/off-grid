// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  FILE_NAME_HEADER,
  PARENT_ID_HEADER,
  fileIdSchema,
  fileNameSchema,
} from "@offgrid/contracts";
import { z } from "zod";
import { contentLengthSchema } from "./content-length-schema.js";
import { declaredMediaTypeSchema } from "./declared-media-type-schema.js";

const percentDecodedNameSchema = z
  .string()
  .min(1)
  .transform((value, context) => {
    try {
      return decodeURIComponent(value);
    } catch {
      context.addIssue({ code: "custom", message: "The file name is not validly percent-encoded" });
      return z.NEVER;
    }
  })
  .pipe(fileNameSchema);

export const uploadHeadersSchema = z
  .object({
    "content-type": declaredMediaTypeSchema.optional(),
    "content-length": contentLengthSchema.optional(),
    [FILE_NAME_HEADER]: percentDecodedNameSchema,
    [PARENT_ID_HEADER]: fileIdSchema.optional(),
  })
  .transform((headers) => ({
    name: headers[FILE_NAME_HEADER],
    parentId: headers[PARENT_ID_HEADER] ?? null,
    declaredMimeType: headers["content-type"] ?? null,
    declaredLength: headers["content-length"] ?? null,
  }));
