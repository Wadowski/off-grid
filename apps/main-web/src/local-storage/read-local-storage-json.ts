// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { z } from "zod";

// Returns the JSON value stored under key when it matches the schema. Returns null when nothing
// is stored, the text is not JSON, the value does not match, or storage is unavailable.
export const readLocalStorageJson = <Schema extends z.ZodType>(
  key: string,
  schema: Schema,
): z.infer<Schema> | null => {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};
