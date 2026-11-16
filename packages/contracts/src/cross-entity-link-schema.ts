// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { crossEntityLinkIdSchema } from "./cross-entity-link-id-schema.js";
import { linkableEntityTypeSchema } from "./linkable-entity-type-schema.js";
import { timestampSchema } from "./timestamp-schema.js";
import { uuidSchema } from "./uuid-schema.js";

export const crossEntityLinkSchema = z.object({
  id: crossEntityLinkIdSchema,
  sourceType: linkableEntityTypeSchema,
  sourceId: uuidSchema,
  targetType: linkableEntityTypeSchema,
  targetId: uuidSchema,
  createdAt: timestampSchema,
});
