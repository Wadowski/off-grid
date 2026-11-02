// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { PasswordProblem } from "../types.js";
import { containsPersonalData } from "./contains-personal-data.js";
import { isTooLong } from "./is-too-long.js";
import { isTooShort } from "./is-too-short.js";
import { isVeryCommon } from "./is-very-common.js";

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
