// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class NotificationNotFoundError extends Error {
  constructor() {
    super("The notification was not found");
    this.name = "NotificationNotFoundError";
  }
}
