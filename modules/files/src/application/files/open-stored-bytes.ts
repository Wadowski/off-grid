// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { StorageObjectNotFoundError, type FileStorage } from "@offgrid/file-storage";
import type { Readable } from "node:stream";
import type { ByteSpan } from "../../types.js";

export const openStoredBytes = async (
  storage: FileStorage,
  storageKey: string,
  span: ByteSpan | null,
): Promise<Readable | null> => {
  try {
    return await storage.get(
      storageKey,
      span === null ? undefined : { start: span.start, end: span.end },
    );
  } catch (error) {
    if (error instanceof StorageObjectNotFoundError) {
      return null;
    }
    throw error;
  }
};
