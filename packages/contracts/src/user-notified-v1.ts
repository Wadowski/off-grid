// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { defineEvent } from "./define-event.js";
import { notificationDataSchema } from "./notification-type-schema.js";
import { uuidSchema } from "./uuid-schema.js";
import { userIdSchema } from "./user-id-schema.js";

export const userNotifiedV1 = defineEvent({
  name: "user-notified-v1",
  version: 1,
  schema: z.object({
    notificationId: uuidSchema,
    userId: userIdSchema,
    type: z.enum(["password-changed", "recovery-code-regenerated"]),
    data: notificationDataSchema,
  }),
});
