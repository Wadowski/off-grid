// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { invitationCodeSchema } from "./invitation-code-schema.js";
import { timestampSchema } from "./timestamp-schema.js";
import { uuidSchema } from "./uuid-schema.js";

export const familyInvitationCreatedSchema = z.object({
  invitationId: uuidSchema,
  code: invitationCodeSchema,
  expiresAt: timestampSchema,
});
