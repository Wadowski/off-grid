// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { driveIdSchema } from "./drive-id-schema.js";

export const driveParamsSchema = z.object({
  id: driveIdSchema,
});
