// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { calendarColorSchema } from "./calendar-color-schema.js";
import { nameSchema } from "./name-schema.js";

export const updateCalendarRequestSchema = z
  .object({
    name: nameSchema.optional(),
    color: calendarColorSchema.optional(),
  })
  .refine((value) => value.name !== undefined || value.color !== undefined, {
    message: "Send a name, a color or both",
  });
