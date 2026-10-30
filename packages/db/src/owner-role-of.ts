// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseSchema } from "./types.js";

export const ownerRoleOf = (schema: DatabaseSchema): string => {
  return `${schema}_owner`;
};
