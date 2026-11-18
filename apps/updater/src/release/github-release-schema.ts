// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const githubReleaseSchema = z.object({
  tag_name: z.string(),
  assets: z.array(z.object({ id: z.number().int().positive(), name: z.string() })),
});
