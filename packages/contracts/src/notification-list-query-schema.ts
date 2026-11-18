// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { notificationCategorySchema } from "./notification-category-schema.js";

export const notificationListQuerySchema = z.object({
  cursor: z.string().min(1).max(512).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: notificationCategorySchema.optional(),
  unread: z.literal("true").optional(),
});
