// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const fileContentQuerySchema = z
  .object({
    disposition: z.enum(["attachment", "inline"]).default("attachment"),
  })
  .strict();
