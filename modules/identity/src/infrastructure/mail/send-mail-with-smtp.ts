// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import nodemailer from "nodemailer";
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
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  try {
    await transport.sendMail(message);
  } finally {
    transport.close();
  }
};
