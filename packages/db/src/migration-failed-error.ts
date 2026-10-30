// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseSchema } from "./types.js";

export class MigrationFailedError extends Error {
  constructor(schema: DatabaseSchema, name: string, cause: unknown) {
    super(`migration ${schema}/${name} failed and was rolled back`, { cause });
    this.name = "MigrationFailedError";
  }
}
