// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const isOtherYear = (dateKey: string, todayKey: string): boolean =>
  dateKey.slice(0, 4) !== todayKey.slice(0, 4);
