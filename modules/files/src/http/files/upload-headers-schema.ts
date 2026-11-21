// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  FILE_NAME_HEADER,
  PARENT_ID_HEADER,
  fileIdSchema,
  fileNameSchema,
} from "@offgrid/contracts";
import { z } from "zod";

const MEDIA_TYPE_PATTERN = /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/;

const declaredMediaTypeSchema = z
  .string()
  .max(255)
  .transform((value) => value.split(";")[0]?.trim().toLowerCase() ?? "")
  .pipe(z.string().regex(MEDIA_TYPE_PATTERN));

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

const contentLengthSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER));

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
