// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const MAX_REMINDER_OFFSET_MINUTES = 40320;
export const MAX_REMINDERS_PER_EVENT = 5;

export const reminderOffsetsSchema = z
  .array(z.number().int().min(0).max(MAX_REMINDER_OFFSET_MINUTES))
  .max(MAX_REMINDERS_PER_EVENT)
  .refine((offsets) => new Set(offsets).size === offsets.length, {
    message: "Send each reminder offset only once",
  });
