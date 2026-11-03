// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const normalizeResetCode = (code: string): string =>
  code.replace(/[\s-]/g, "").toUpperCase();
