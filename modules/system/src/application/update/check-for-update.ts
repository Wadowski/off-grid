// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SystemUpdateCheck, UpdateDependencies } from "../../types.js";
import { assertInstanceAdmin } from "./assert-instance-admin.js";
import { recordUpdateCheck } from "./record-update-check.js";

export const checkForUpdate = async (
  deps: UpdateDependencies,
  userId: string,
): Promise<SystemUpdateCheck> => {
  await assertInstanceAdmin(deps.isInstanceAdmin, userId);
  const check = await recordUpdateCheck(deps);
  return { ...check, checkedAt: check.checkedAt.toISOString() };
};
