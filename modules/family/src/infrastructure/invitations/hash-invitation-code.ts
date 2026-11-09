// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash } from "node:crypto";

export const hashInvitationCode = (code: string): string =>
  createHash("sha256").update(code).digest("hex");
