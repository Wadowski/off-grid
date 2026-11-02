// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const signInRequestSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(512),
  rememberMe: z.boolean().optional(),
  deviceLabel: z.string().trim().min(1).max(100).optional(),
});
