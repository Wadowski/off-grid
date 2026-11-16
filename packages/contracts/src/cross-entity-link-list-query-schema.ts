// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { linkableEntityTypeSchema } from "./linkable-entity-type-schema.js";
import { uuidSchema } from "./uuid-schema.js";

export const crossEntityLinkListQuerySchema = z.object({
  entityType: linkableEntityTypeSchema,
  entityId: uuidSchema,
});
