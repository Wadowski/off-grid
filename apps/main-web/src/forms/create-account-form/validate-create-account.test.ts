// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { validateCreateAccount } from "./validate-create-account.js";

const validValues = {
  displayName: "Anna",
  email: "anna@example.com",
  password: "correct horse battery",
  confirmation: "correct horse battery",
};

describe("validateCreateAccount", () => {
  it("accepts a complete form with matching passwords", () => {
    expect(
      Object.values(validateCreateAccount(validValues)).every((error) => error === undefined),
    ).toBe(true);
  });

  it("requires a name that is not blank", () => {
    expect(validateCreateAccount({ ...validValues, displayName: "   " }).displayName).toBe(
      "createAccount.nameRequired",
    );
  });

  it("rejects an email address that is not valid", () => {
    expect(validateCreateAccount({ ...validValues, email: "anna" }).email).toBe(
      "createAccount.emailInvalid",
    );
  });

  it("requires a password of at least 12 characters", () => {
    expect(
      validateCreateAccount({ ...validValues, password: "short", confirmation: "short" }).password,
    ).toBe("createAccount.passwordTooShort");
  });

  it("reports a mismatched confirmation", () => {
    expect(
      validateCreateAccount({ ...validValues, confirmation: "something else" }).confirmation,
    ).toBe("createAccount.passwordsDoNotMatch");
  });
});
