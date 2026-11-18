// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { notificationCategorySchema } from "./notification-category-schema.js";
import { notificationDataSchema, notificationTypeSchema } from "./notification-type-schema.js";
import { timestampSchema } from "./timestamp-schema.js";
import { uuidSchema } from "./uuid-schema.js";

export const notificationSchema = z.object({
  id: uuidSchema,
  type: notificationTypeSchema,
  category: notificationCategorySchema,
  data: notificationDataSchema,
  createdAt: timestampSchema,
  readAt: timestampSchema.nullable(),
});

export const notificationListSchema = z.object({
  notifications: z.array(notificationSchema),
  unreadCount: z.number().int().nonnegative(),
  nextCursor: z.string().min(1).max(512).nullable(),
  total: z.number().int().nonnegative(),
});
