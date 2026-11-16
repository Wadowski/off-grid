// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { crossEntityLinkWithTitleSchema } from "./cross-entity-link-with-title-schema.js";

export const crossEntityLinkListSchema = z.object({
  links: z.array(crossEntityLinkWithTitleSchema),
});
