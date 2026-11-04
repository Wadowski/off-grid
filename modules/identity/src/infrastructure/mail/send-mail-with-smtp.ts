// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import nodemailer from "nodemailer";
import { MAIL_CONNECTION_TIMEOUT_MS, MAIL_SOCKET_TIMEOUT_MS } from "../../constants.js";
import type { MailConnection, MailMessage } from "../../types.js";

export const sendMailWithSmtp = async (
  connection: MailConnection,
  message: MailMessage,
): Promise<void> => {
  const transport = nodemailer.createTransport({
    host: connection.host,
    port: connection.port,
    secure: connection.security === "tls",
    requireTLS: connection.security === "starttls",
    ignoreTLS: connection.security === "none",
    auth: { user: connection.username, pass: connection.password },
    connectionTimeout: MAIL_CONNECTION_TIMEOUT_MS,
    greetingTimeout: MAIL_CONNECTION_TIMEOUT_MS,
    socketTimeout: MAIL_SOCKET_TIMEOUT_MS,
  });
  try {
    await transport.sendMail(message);
  } finally {
    transport.close();
  }
};
