// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MAIL_NOTIFICATION_TEXT } from "../../constants.js";
import type { MailMessage, NotificationType } from "../../types.js";

export const buildMailMessage = (
  notificationType: NotificationType,
  recipient: string,
  fromAddress: string,
): MailMessage => {
  const content = MAIL_NOTIFICATION_TEXT[notificationType];
  return { to: recipient, from: fromAddress, subject: content.subject, text: content.text };
};
