// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { familyNameSchema } from "./family-name-schema.js";
import { timestampSchema } from "./timestamp-schema.js";
import { uuidSchema } from "./uuid-schema.js";

export const familyInvitationPreviewSchema = z.object({
  familyId: uuidSchema,
  familyName: familyNameSchema,
  familyCreatedAt: timestampSchema,
  invitedBy: z.object({
    displayName: z.string().min(1).max(100).nullable(),
  }),
});

export type InvitationPreview = z.infer<typeof familyInvitationPreviewSchema>;
