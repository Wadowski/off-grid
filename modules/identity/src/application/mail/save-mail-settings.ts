// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { resolveMailConnection } from "../../domain/mail/resolve-mail-connection.js";
import { toMailSettingsView } from "../../domain/mail/to-mail-settings-view.js";
import { sealMailPassword } from "../../infrastructure/mail/seal-mail-password.js";
import { readMailSettings } from "../../infrastructure/mail/read-mail-settings.js";
import { upsertMailSettings } from "../../infrastructure/mail/upsert-mail-settings.js";
import type { MailSettingsRequest, MailSettingsView } from "../../types.js";
import { assertActiveAdmin } from "../admin/assert-active-admin.js";

export const saveMailSettings = (
  db: ModuleDatabase,
  encryptionKey: Buffer,
  actorUserId: string,
  request: MailSettingsRequest,
  now: Date = new Date(),
): Promise<MailSettingsView> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, actorUserId);
    await assertActiveAdmin(tx, actorUserId);
    const connection = resolveMailConnection(request);
    await upsertMailSettings(
      tx,
      {
        provider: request.provider,
        fromAddress: connection.fromAddress,
        smtpHost: connection.host,
        smtpPort: connection.port,
        smtpSecurity: connection.security,
        username: connection.username,
        passwordSealed: sealMailPassword(encryptionKey, connection.password),
      },
      now,
    );
    return toMailSettingsView(await readMailSettings(tx));
  });
