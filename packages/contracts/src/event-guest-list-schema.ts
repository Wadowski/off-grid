// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { timestampSchema } from "./timestamp-schema.js";
import { uuidSchema } from "./uuid-schema.js";

export const eventGuestListSchema = z.object({
  guests: z.array(
    z.object({
      userId: uuidSchema,
      invitedAt: timestampSchema,
    }),
  ),
});
