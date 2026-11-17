// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const systemVersionSchema = z.strictObject({
  version: z.string().min(1),
  commit: z.string().min(1).optional(),
});
