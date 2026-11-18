// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const NOTIFICATION_TYPES = [
  "password-changed",
  "recovery-code-regenerated",
  "event-invited",
  "event-reminder",
] as const;

export const notificationTypeSchema = z.enum(NOTIFICATION_TYPES);

export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationDataSchema = z.record(z.string(), z.string());
