// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { notificationSchema } from "@offgrid/contracts";
import { parseJsonOrUndefined } from "./parse-json-or-undefined.js";
import type { Notification } from "./types.js";

export const parseNotificationData = (data: string): Notification | undefined => {
  const result = notificationSchema.safeParse(parseJsonOrUndefined(data));
  return result.success ? result.data : undefined;
};
