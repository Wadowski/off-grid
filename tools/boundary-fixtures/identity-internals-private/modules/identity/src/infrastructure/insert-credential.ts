// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const insertCredential = (userId: string, passwordHash: string): string =>
  `${userId}:${passwordHash}`;
