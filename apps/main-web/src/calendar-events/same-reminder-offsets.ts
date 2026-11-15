// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const ascending = (left: number, right: number): number => left - right;

export const sameReminderOffsets = (
  first: readonly number[],
  second: readonly number[],
): boolean => {
  const left = [...first].sort(ascending);
  const right = [...second].sort(ascending);
  return left.length === right.length && left.every((value, index) => value === right[index]);
};
