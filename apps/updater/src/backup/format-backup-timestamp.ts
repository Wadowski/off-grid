// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const formatBackupTimestamp = (createdAt: Date): string =>
  createdAt.toISOString().slice(0, 19).replace(/[-:]/g, "") + "Z";
