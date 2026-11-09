// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomBytes } from "node:crypto";
import { INVITATION_CODE_BYTES } from "../../constants.js";

export const generateInvitationCode = (): string =>
  randomBytes(INVITATION_CODE_BYTES).toString("base64url");
