// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1).max(512),
  newPassword: z.string().min(1).max(512),
});
