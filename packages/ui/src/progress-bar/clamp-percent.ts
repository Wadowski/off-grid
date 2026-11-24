// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const clampPercent = (value: number): number =>
  Math.min(100, Math.max(0, Math.round(value)));
