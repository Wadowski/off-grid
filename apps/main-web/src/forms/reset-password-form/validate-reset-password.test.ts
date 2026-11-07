// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { validateResetPassword } from "./validate-reset-password.js";

const STRONG = "correct horse battery";

describe("validateResetPassword", () => {
  it("accepts a code, a strong password and a matching confirmation", () => {
    expect(
      validateResetPassword({ code: "ABCD-1234", password: STRONG, confirmation: STRONG }),
    ).toEqual({ code: undefined, password: undefined, confirmation: undefined });
  });

  it("asks for the code when it is blank", () => {
    expect(validateResetPassword({ code: "  ", password: STRONG, confirmation: STRONG }).code).toBe(
      "resetPassword.codeRequired",
    );
  });

  it("reports a short password and a mismatched confirmation together", () => {
    const errors = validateResetPassword({ code: "x", password: "short", confirmation: "other" });

    expect(errors.password).toBe("createAccount.passwordTooShort");
    expect(errors.confirmation).toBe("createAccount.passwordsDoNotMatch");
  });
});
