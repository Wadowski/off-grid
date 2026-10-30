// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Client } from "pg";
import { INIT_SCRIPTS } from "./constants.js";
import { readFile } from "node:fs/promises";

export const runInitScripts = async (admin: Client): Promise<void> => {
  for (const script of INIT_SCRIPTS) {
    await admin.query(await readFile(new URL(script, import.meta.url), "utf8"));
  }
};
