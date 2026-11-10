// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { defineEvent } from "./define-event.js";
import { userIdSchema } from "./user-id-schema.js";

export const passwordChangedV1 = defineEvent({
  name: "password-changed-v1",
  version: 1,
  schema: z.object({
    userId: userIdSchema,
  }),
});
