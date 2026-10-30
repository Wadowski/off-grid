// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const isWalkable = (value: unknown): value is object =>
  value !== null && typeof value === "object" && !(value instanceof Date);
