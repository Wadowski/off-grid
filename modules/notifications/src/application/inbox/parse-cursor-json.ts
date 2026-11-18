// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { InvalidNotificationCursorError } from "../errors/invalid-notification-cursor-error.js";

export const parseCursorJson = (value: string): unknown => {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    throw new InvalidNotificationCursorError();
  }
};
