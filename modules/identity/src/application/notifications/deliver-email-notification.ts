// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext } from "@offgrid/db";
import { buildMailMessage } from "../../domain/mail/build-mail-message.js";
import { findAccount } from "../../infrastructure/accounts/find-account.js";
import type { EmailChannelDependencies, NewNotification } from "../../types.js";
import { loadMailConnection } from "../mail/load-mail-connection.js";
import { sendWithRetry } from "./send-with-retry.js";

export const deliverEmailNotification = async (
  dependencies: EmailChannelDependencies,
  notification: NewNotification,
): Promise<void> => {
  const { connection, recipient } = await dependencies.db.$transaction(async (tx) => {
    await withUserContext(tx, notification.userId);
    return {
      connection: await loadMailConnection(tx, dependencies.encryptionKey),
      recipient: (await findAccount(tx, notification.userId))?.email ?? null,
    };
  });
  if (connection === null || recipient === null) {
    return;
  }
  const message = buildMailMessage(notification.type, recipient, connection.fromAddress);
  sendWithRetry(
    () => dependencies.sendMail(connection, message),
    dependencies.retryDelaysMs,
    dependencies.logger,
    { channel: "email", notificationType: notification.type },
  );
};
