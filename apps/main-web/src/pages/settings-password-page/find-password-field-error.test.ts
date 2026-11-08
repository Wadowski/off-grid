// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { PASSWORD_MIN_LENGTH } from "../../constants.js";
import { findPasswordFieldError } from "./find-password-field-error.js";

const LONG_PASSWORD = "a".repeat(PASSWORD_MIN_LENGTH);

describe("findPasswordFieldError", () => {
  it("asks for the current password when it is empty", () => {
    expect(
      findPasswordFieldError({
        currentPassword: "",
        newPassword: LONG_PASSWORD,
        confirmation: LONG_PASSWORD,
      }),
    ).toEqual({ currentPassword: "settings.currentPasswordRequired" });
  });

  it("refuses a new password shorter than the minimum length", () => {
    expect(
      findPasswordFieldError({
        currentPassword: "old",
        newPassword: "short",
        confirmation: "short",
      }),
    ).toEqual({ newPassword: "settings.passwordTooShort" });
  });

  it("refuses a confirmation that does not match the new password", () => {
    expect(
      findPasswordFieldError({
        currentPassword: "old",
        newPassword: LONG_PASSWORD,
        confirmation: `${LONG_PASSWORD}x`,
      }),
    ).toEqual({ confirmation: "settings.confirmationMismatch" });
  });

  it("accepts a valid change", () => {
    expect(
      findPasswordFieldError({
        currentPassword: "old",
        newPassword: LONG_PASSWORD,
        confirmation: LONG_PASSWORD,
      }),
    ).toEqual({});
  });
});
