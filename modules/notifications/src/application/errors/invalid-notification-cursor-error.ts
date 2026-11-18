// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class InvalidNotificationCursorError extends Error {
  constructor() {
    super("Notification cursor is invalid");
    this.name = "InvalidNotificationCursorError";
  }
}
