// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { displayNameSchema } from "./display-name-schema.js";
import { familyIdSchema } from "./family-id-schema.js";
import { familyNameSchema } from "./family-name-schema.js";
import { timestampSchema } from "./timestamp-schema.js";

export const familyInvitationPreviewSchema = z.object({
  familyId: familyIdSchema,
  familyName: familyNameSchema,
  familyCreatedAt: timestampSchema,
  invitedBy: z.object({
    displayName: displayNameSchema.nullable(),
  }),
});

export type InvitationPreview = z.infer<typeof familyInvitationPreviewSchema>;
