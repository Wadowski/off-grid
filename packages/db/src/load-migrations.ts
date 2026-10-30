// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MigrationSource, Migration } from "./types.js";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { checksumOf } from "./checksum-of.js";

export const loadMigrations = async (source: MigrationSource): Promise<Migration[]> => {
  const names = (await readdir(source.directory)).filter((n) => n.endsWith(".sql")).sort();
  return Promise.all(
    names.map(async (name) => {
      const sql = await readFile(join(source.directory, name), "utf8");
      return { schema: source.schema, name, sql, checksum: checksumOf(sql) };
    }),
  );
};
