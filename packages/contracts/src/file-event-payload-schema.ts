// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { byteSizeSchema } from "./byte-size-schema.js";
import { fileNameSchema } from "./file-name-schema.js";
import { fileOwnerFieldsSchema } from "./file-owner-fields-schema.js";
import { hasExactlyOneOwner } from "./has-exactly-one-owner.js";
import { timestampSchema } from "./timestamp-schema.js";
import { uuidSchema } from "./uuid-schema.js";

export const fileEventPayloadSchema = z
  .strictObject({
    fileId: uuidSchema,
    driveId: uuidSchema,
    ...fileOwnerFieldsSchema,
    parentId: uuidSchema.nullable(),
    isFolder: z.boolean(),
    name: fileNameSchema,
    size: byteSizeSchema.nullable(),
    currentVersionId: uuidSchema.nullable(),
    deletedAt: timestampSchema.nullable(),
    version: z.number().int().min(1),
  })
  .refine(
    (payload) => hasExactlyOneOwner(payload.ownerUserId, payload.ownerFamilyId),
    "Exactly one of ownerUserId and ownerFamilyId must be set.",
  );
