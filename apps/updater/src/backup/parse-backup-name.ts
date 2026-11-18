// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { BACKUP_NAME_PATTERN } from "../constants.js";
import type { ParsedBackupName } from "../types.js";

export const parseBackupName = (name: string): ParsedBackupName | undefined => {
  const groups = BACKUP_NAME_PATTERN.exec(name)?.groups;
  if (groups?.version === undefined || groups.stamp === undefined) {
    return undefined;
  }
  return { name, version: groups.version, stamp: groups.stamp };
};
