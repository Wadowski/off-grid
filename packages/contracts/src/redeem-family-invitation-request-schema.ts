// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { invitationCodeSchema } from "./invitation-code-schema.js";

export const redeemFamilyInvitationRequestSchema = z.object({
  code: invitationCodeSchema,
});
