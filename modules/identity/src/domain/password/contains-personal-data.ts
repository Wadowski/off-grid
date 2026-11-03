// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const containsPersonalData = (password: string, fragments: readonly string[]): boolean => {
  const lowered = password.toLowerCase();
  return fragments.some((fragment) => lowered.includes(fragment));
};
