// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { defineEvent } from "./define-event.js";
import { familyNameSchema } from "./family-name-schema.js";

export const familyCreatedV1 = defineEvent({
  name: "family-created-v1",
  version: 1,
  schema: z.object({
    name: familyNameSchema,
  }),
});
