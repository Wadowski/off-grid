// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileStorage, StoredObject } from "@offgrid/file-storage";
import type { FileVersionRecord } from "../../types.js";

export const copyFileBytes = async (
  storage: FileStorage,
  version: FileVersionRecord,
): Promise<StoredObject> => storage.put(await storage.get(version.storageKey));
