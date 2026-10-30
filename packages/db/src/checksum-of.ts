// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash } from "node:crypto";

export const checksumOf = (sql: string): string => {
  return createHash("sha256").update(sql).digest("hex");
};
