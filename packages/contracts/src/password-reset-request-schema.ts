// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const passwordResetRequestSchema = z.object({
  code: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(512),
});
