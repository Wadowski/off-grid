// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import type { FileStorage } from "@offgrid/file-storage";
import { TRASH_PURGE_TRANSACTION_TIMEOUT_MS } from "../../constants.js";
import type { TrashedRootPurgeOutcome } from "../../types.js";
import { deleteStoredBytes } from "../files/delete-stored-bytes.js";
import { purgeRootInTransaction } from "./purge-root-in-transaction.js";

export const purgeTrashedRoot = async (
  db: ModuleDatabase,
  storage: FileStorage,
  userId: string,
  rootId: string,
): Promise<TrashedRootPurgeOutcome> => {
  const write = await db.$transaction(
    async (tx) => {
      await withUserContext(tx, userId);
      return purgeRootInTransaction(tx, rootId);
    },
    { timeout: TRASH_PURGE_TRANSACTION_TIMEOUT_MS },
  );
  if (write.outcome === "purged") {
    await deleteStoredBytes(storage, write.storageKeys);
    return { outcome: "found", value: null };
  }
  return write;
};
