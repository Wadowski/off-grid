// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { setPgUserContext } from "@offgrid/db";
import { classifySourceVersion } from "@offgrid/event-bus";
import type { SubscriberClient } from "../../types.js";
import { findAccountSourceVersion } from "../../infrastructure/account-names/find-account-source-version.js";
import { upsertAccountName } from "../../infrastructure/account-names/upsert-account-name.js";

interface AccountNameChange {
  readonly userId: string;
  readonly displayName: string;
  readonly sourceVersion: number;
}

export const applyAccountName = async (
  client: SubscriberClient,
  change: AccountNameChange,
): Promise<void> => {
  await setPgUserContext(client, change.userId);
  const stored = await findAccountSourceVersion(client, change.userId);
  const outcome = classifySourceVersion(stored, change.sourceVersion);
  if (outcome === "gap") {
    throw new Error("account name change arrived before an earlier change");
  }
  if (outcome !== "apply") {
    return;
  }
  await upsertAccountName(client, change);
};
