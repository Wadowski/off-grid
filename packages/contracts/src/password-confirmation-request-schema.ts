// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const passwordConfirmationRequestSchema = z.object({
  password: z.string().min(1).max(512),
});
