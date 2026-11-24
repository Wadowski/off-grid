// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { findTrashedChainTopDown } from "./find-trashed-chain-top-down.js";
import { lockTrashedRootsInOrder } from "./lock-trashed-roots-in-order.js";

export const lockTrashedChain = async (tx: ModuleTransaction, fileId: string): Promise<void> => {
  for (;;) {
    const chain = await findTrashedChainTopDown(tx, fileId);
    if (chain.length === 0) {
      return;
    }
    const locked = await lockTrashedRootsInOrder(tx, chain);
    if (locked && chain.join() === (await findTrashedChainTopDown(tx, fileId)).join()) {
      return;
    }
  }
};
