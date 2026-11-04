// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MailFailureReason } from "../../types.js";

export class MailTestFailedError extends Error {
  readonly reason: MailFailureReason;

  constructor(reason: MailFailureReason) {
    super("The test email could not be sent");
    this.name = "MailTestFailedError";
    this.reason = reason;
  }
}
