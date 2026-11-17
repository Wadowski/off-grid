// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { driveSchema } from "./drive-schema.js";

export const driveListSchema = z.object({
  drives: z.array(driveSchema),
});
