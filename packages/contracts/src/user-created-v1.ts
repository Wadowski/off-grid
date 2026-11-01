// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { defineEvent } from "./define-event.js";
import { displayNameSchema } from "./display-name-schema.js";
import { userIdSchema } from "./user-id-schema.js";

export const userCreatedV1 = defineEvent({
  name: "user-created-v1",
  version: 1,
  schema: z.object({
    userId: userIdSchema,
    displayName: displayNameSchema,
  }),
});
