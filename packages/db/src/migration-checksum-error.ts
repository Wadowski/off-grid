// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseSchema } from "./types.js";

export class MigrationChecksumError extends Error {
  constructor(schema: DatabaseSchema, name: string) {
    super(
      `migration ${schema}/${name} was applied with different contents; add a new migration instead of editing it`,
    );
    this.name = "MigrationChecksumError";
  }
}
