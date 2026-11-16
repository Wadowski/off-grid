// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { connectionFileSchema } from "./connection-file-schema.js";
import { parseJson } from "./parse-json.js";
import type { SharedClusterConnection } from "./types.js";

export const parseConnectionFile = (contents: string): SharedClusterConnection => {
  const json = parseJson(contents);
  const result = connectionFileSchema.safeParse(json);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Shared test database connection file is invalid (fields: ${fields})`);
  }
  return result.data;
};
