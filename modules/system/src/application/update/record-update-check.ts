// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { writeUpdateCheck } from "../../infrastructure/update-settings/write-update-check.js";
import type { UpdateDependencies, UpdaterCheck } from "../../types.js";

export const recordUpdateCheck = async (
  deps: UpdateDependencies,
): Promise<UpdaterCheck & { readonly checkedAt: Date }> => {
  const check = await deps.updater.checkForUpdate();
  const checkedAt = new Date();
  await writeUpdateCheck(deps.db, { ...check, checkedAt });
  return { ...check, checkedAt };
};
