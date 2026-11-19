// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const cursorPayloadSchema = z.object({
  isFolder: z.boolean(),
  name: z.string().min(1).max(255),
  fileId: z.uuid(),
});
