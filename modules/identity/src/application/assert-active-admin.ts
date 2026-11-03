// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { isActiveAdmin } from "../domain/is-active-admin.js";
import { findAccount } from "../infrastructure/find-account.js";
import { AdminRequiredError } from "./admin-required-error.js";

export const assertActiveAdmin = async (
  tx: ModuleTransaction,
  actorUserId: string,
): Promise<void> => {
  const actor = await findAccount(tx, actorUserId);
  if (actor === null || !isActiveAdmin(actor)) {
    throw new AdminRequiredError();
  }
};
