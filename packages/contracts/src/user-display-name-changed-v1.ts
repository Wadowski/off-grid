// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { defineEvent } from "./define-event.js";
import { displayNameSchema } from "./display-name-schema.js";
import { userIdSchema } from "./user-id-schema.js";

export const userDisplayNameChangedV1 = defineEvent({
  name: "user-display-name-changed-v1",
  version: 1,
  schema: z.object({
    userId: userIdSchema,
    displayName: displayNameSchema,
  }),
});
