// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { toMailSettingsView } from "../../domain/mail/to-mail-settings-view.js";
import { readMailSettings } from "../../infrastructure/mail/read-mail-settings.js";
import type { MailSettingsView } from "../../types.js";
import { assertActiveAdmin } from "../admin/assert-active-admin.js";

export const getMailSettings = (
  db: ModuleDatabase,
  actorUserId: string,
): Promise<MailSettingsView> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, actorUserId);
    await assertActiveAdmin(tx, actorUserId);
    return toMailSettingsView(await readMailSettings(tx));
  });
