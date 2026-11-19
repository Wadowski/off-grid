// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateStatus } from "../types.js";
import { parseStatusJson } from "./parse-status-json.js";
import { readStatusFileText } from "./read-status-file-text.js";
import { updateStatusSchema } from "@offgrid/contracts";

export const readUpdateStatus = async (statusFile: string): Promise<UpdateStatus | null> => {
  const statusText = await readStatusFileText(statusFile);
  if (statusText === null) {
    return null;
  }
  return updateStatusSchema.parse(parseStatusJson(statusText));
};
