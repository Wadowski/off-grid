// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { timeZoneSchema } from "./calendar-time-zone-schema.js";

export const updateCalendarTimeZoneRequestSchema = z.strictObject({
  timeZone: timeZoneSchema,
});
