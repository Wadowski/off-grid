// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const NOTIFICATION_TYPES = ["password-changed", "recovery-code-regenerated"] as const;

export const notificationTypeSchema = z.enum(NOTIFICATION_TYPES);

export const notificationDataSchema = z.record(z.string(), z.string());
