// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ParsedBackupName } from "../types.js";

export const selectBackupsToPrune = (
  backups: readonly ParsedBackupName[],
  retention: number,
  keptName: string,
): ParsedBackupName[] =>
  [...backups]
    .sort((left, right) => right.stamp.localeCompare(left.stamp))
    .slice(retention)
    .filter((backup) => backup.name !== keptName);
