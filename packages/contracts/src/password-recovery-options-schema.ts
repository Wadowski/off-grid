// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const passwordRecoveryOptionsSchema = z.object({
  emailCodeAvailable: z.boolean(),
});
