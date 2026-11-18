// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { stat } from "node:fs/promises";
import type { DatabaseTools } from "../types.js";

export const verifyDump = async (tools: DatabaseTools, dumpFile: string): Promise<void> => {
  const { size } = await stat(dumpFile);
  if (size === 0) {
    throw new Error("dump file is empty");
  }
  await tools.listDump(dumpFile);
};
