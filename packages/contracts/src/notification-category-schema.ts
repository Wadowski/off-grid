// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const NOTIFICATION_CATEGORIES = ["calendar", "account-security"] as const;

export const notificationCategorySchema = z.enum(NOTIFICATION_CATEGORIES);

export type NotificationCategory = z.infer<typeof notificationCategorySchema>;
