// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { displayNameSchema } from "@offgrid/contracts";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { updateDisplayName } from "../../infrastructure/accounts/update-display-name.js";

export const updateOwnDisplayName = (
  db: ModuleDatabase,
  userId: string,
  displayName: string,
): Promise<void> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    await updateDisplayName(tx, userId, displayNameSchema.parse(displayName));
  });
