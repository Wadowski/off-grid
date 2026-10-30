// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const migrationKey = (module: string, name: string, checksum: string): string => {
  return `${module}/${name}/${checksum}`;
};
