// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MailMessage } from "../../types.js";

export const buildRecoveryCodeMessage = (
  code: string,
  recipient: string,
  fromAddress: string,
): MailMessage => ({
  to: recipient,
  from: fromAddress,
  subject: "Your Offgrid password reset code",
  text: `Your password reset code is ${code}.\n\nIt works once and expires in 10 minutes. If you did not ask for it, you can ignore this email.`,
});
