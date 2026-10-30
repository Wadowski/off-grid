// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseSchema } from "./types.js";
import { DATABASE_SCHEMAS } from "./constants.js";

export const isDatabaseSchema = (value: string): value is DatabaseSchema => {
  return DATABASE_SCHEMAS.some((schema) => schema === value);
};
