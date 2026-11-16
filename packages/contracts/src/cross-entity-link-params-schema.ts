// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { crossEntityLinkIdSchema } from "./cross-entity-link-id-schema.js";

export const crossEntityLinkParamsSchema = z.object({
  id: crossEntityLinkIdSchema,
});
