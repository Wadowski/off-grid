// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const recoveryCodeIssuedSchema = z.object({
  recoveryCode: z.string().min(1),
});
