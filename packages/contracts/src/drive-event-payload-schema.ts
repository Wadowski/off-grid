// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { fileOwnerFieldsSchema } from "./file-owner-fields-schema.js";
import { hasExactlyOneOwner } from "./has-exactly-one-owner.js";
import { uuidSchema } from "./uuid-schema.js";

export const driveEventPayloadSchema = z
  .strictObject({
    driveId: uuidSchema,
    ...fileOwnerFieldsSchema,
  })
  .refine(
    (payload) => hasExactlyOneOwner(payload.ownerUserId, payload.ownerFamilyId),
    "Exactly one of ownerUserId and ownerFamilyId must be set.",
  );
