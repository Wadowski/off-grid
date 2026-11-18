// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describeFileStorageContract } from "../../test/describe-file-storage-contract.js";
import { createInMemoryFileStorage } from "./create-in-memory-file-storage.js";

describeFileStorageContract("in-memory", async () => ({
  storage: createInMemoryFileStorage(),
  cleanup: async () => undefined,
}));
