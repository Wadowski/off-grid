// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withFamilyContext, withUserContext, type ModuleTransaction } from "@offgrid/db";
import type { ActingContext } from "../../types.js";

export const setLinkContext = async (
  tx: ModuleTransaction,
  acting: ActingContext,
): Promise<void> => {
  await withUserContext(tx, acting.userId);
  if (acting.familyId !== null) {
    await withFamilyContext(tx, acting.familyId);
  }
};
