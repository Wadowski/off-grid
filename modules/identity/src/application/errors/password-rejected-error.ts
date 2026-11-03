// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { PasswordProblem } from "../../types.js";

export class PasswordRejectedError extends Error {
  readonly problems: readonly PasswordProblem[];

  constructor(problems: readonly PasswordProblem[]) {
    super("Password does not meet the rules");
    this.name = "PasswordRejectedError";
    this.problems = problems;
  }
}
