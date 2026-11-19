// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { writeNightlyUpdate } from "../../infrastructure/update-settings/write-nightly-update.js";
import type { SystemNightlySetting, UpdateDependencies } from "../../types.js";
import { assertInstanceAdmin } from "./assert-instance-admin.js";

export const setNightlyUpdate = async (
  deps: UpdateDependencies,
  userId: string,
  enabled: boolean,
): Promise<SystemNightlySetting> => {
  await assertInstanceAdmin(deps.isInstanceAdmin, userId);
  await writeNightlyUpdate(deps.db, enabled);
  return { enabled };
};
