// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { calendarIdSchema } from "./calendar-id-schema.js";

export const calendarParamsSchema = z.object({
  id: calendarIdSchema,
});
