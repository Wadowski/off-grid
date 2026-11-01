// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Migration } from "./types.js";
import { checksumOf } from "./checksum-of.js";

export const loadMigrations = async (directory: string): Promise<Migration[]> => {
  const names = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  return Promise.all(
    names.map(async (name) => {
      const sql = await readFile(join(directory, name, "migration.sql"), "utf8");
      return { name, sql, checksum: checksumOf(sql) };
    }),
  );
};
