// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { displayNameSchema } from "@offgrid/contracts";
import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { updateDisplayName } from "../../infrastructure/accounts/update-display-name.js";
import { publishUserDisplayNameChanged } from "../../events/publish-user-display-name-changed.js";

export const updateOwnDisplayName = (
  db: ModuleDatabase,
  userId: string,
  displayName: string,
): Promise<void> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    const name = displayNameSchema.parse(displayName);
    const sourceVersion = await updateDisplayName(tx, userId, name);
    await publishUserDisplayNameChanged(tx, userId, name, sourceVersion);
  });
