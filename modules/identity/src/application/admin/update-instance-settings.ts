// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { setRegistrationOpen } from "../../infrastructure/instance-settings/set-registration-open.js";
import type { InstanceSettings } from "../../types.js";
import { assertActiveAdmin } from "./assert-active-admin.js";

export const updateInstanceSettings = (
  db: ModuleDatabase,
  actorUserId: string,
  registrationOpen: boolean,
): Promise<InstanceSettings> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, actorUserId);
    await assertActiveAdmin(tx, actorUserId);
    await setRegistrationOpen(tx, registrationOpen);
    return { registrationOpen };
  });
