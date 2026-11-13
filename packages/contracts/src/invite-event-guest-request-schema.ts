// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { uuidSchema } from "./uuid-schema.js";

export const inviteEventGuestRequestSchema = z.strictObject({
  guestUserId: uuidSchema,
});
