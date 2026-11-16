// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withFamilyContext, withUserContext, type ModuleTransaction } from "@offgrid/db";
import type { LinkOwner } from "../../types.js";

export const setOwnerContext = async (tx: ModuleTransaction, owner: LinkOwner): Promise<void> => {
  if (owner.familyId !== null) {
    await withFamilyContext(tx, owner.familyId);
    return;
  }
  if (owner.userId !== null) {
    await withUserContext(tx, owner.userId);
  }
};
