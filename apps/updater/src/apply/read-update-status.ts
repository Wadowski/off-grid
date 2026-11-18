// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateStatus } from "../types.js";
import { readStatusFileText } from "./read-status-file-text.js";
import { updateStatusSchema } from "./update-status-schema.js";

export const readUpdateStatus = async (statusFile: string): Promise<UpdateStatus | null> => {
  const statusText = await readStatusFileText(statusFile);
  if (statusText === null) {
    return null;
  }
  return updateStatusSchema.parse(JSON.parse(statusText));
};
