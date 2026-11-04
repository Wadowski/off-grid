// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { withUserContext } from "@offgrid/db";
import { readMailSettings } from "../../infrastructure/mail/read-mail-settings.js";

export const isMailConfigured = (db: ModuleDatabase, actorUserId: string): Promise<boolean> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, actorUserId);
    return (await readMailSettings(tx)) !== null;
  });
