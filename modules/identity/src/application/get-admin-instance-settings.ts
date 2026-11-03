// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { readInstanceSettings } from "../infrastructure/read-instance-settings.js";
import type { InstanceSettings } from "../types.js";
import { assertActiveAdmin } from "./assert-active-admin.js";

export const getAdminInstanceSettings = (
  db: ModuleDatabase,
  actorUserId: string,
): Promise<InstanceSettings> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, actorUserId);
    await assertActiveAdmin(tx, actorUserId);
    return readInstanceSettings(tx);
  });
