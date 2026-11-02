// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, VERY_COMMON_PASSWORDS } from "../constants.js";
import type { PasswordProblem } from "../types.js";

const isTooShort = (password: string): boolean => [...password].length < PASSWORD_MIN_LENGTH;

const isTooLong = (password: string): boolean => [...password].length > PASSWORD_MAX_LENGTH;

const isVeryCommon = (password: string): boolean =>
  VERY_COMMON_PASSWORDS.has(password.toLowerCase());

const containsPersonalData = (password: string, fragments: readonly string[]): boolean => {
  const lowered = password.toLowerCase();
  return fragments.some((fragment) => lowered.includes(fragment));
};

export const findPasswordProblems = (
  password: string,
  personalFragments: readonly string[],
): PasswordProblem[] => {
  const problems: PasswordProblem[] = [];
  if (isTooShort(password)) {
    problems.push("PASSWORD_TOO_SHORT");
  }
  if (isTooLong(password)) {
    problems.push("PASSWORD_TOO_LONG");
  }
  if (isVeryCommon(password)) {
    problems.push("PASSWORD_TOO_COMMON");
  }
  if (containsPersonalData(password, personalFragments)) {
    problems.push("PASSWORD_CONTAINS_PERSONAL_DATA");
  }
  return problems;
};
