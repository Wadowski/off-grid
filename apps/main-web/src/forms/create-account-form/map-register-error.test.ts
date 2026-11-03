// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { describe, expect, it } from "vitest";
import { mapRegisterError } from "./map-register-error.js";

describe("mapRegisterError", () => {
  it("shows a taken email on the email field", () => {
    expect(mapRegisterError(new ApiError(409, "EMAIL_TAKEN", "taken"))).toEqual({
      kind: "field",
      field: "email",
      textId: "createAccount.emailTaken",
    });
  });

  it("shows a rejected password on the password field", () => {
    expect(mapRegisterError(new ApiError(400, "PASSWORD_TOO_COMMON", "common"))).toEqual({
      kind: "field",
      field: "password",
      textId: "createAccount.passwordTooCommon",
    });
  });

  it("reports closed registration", () => {
    expect(mapRegisterError(new ApiError(403, "REGISTRATION_CLOSED", "closed"))).toEqual({
      kind: "registrationClosed",
    });
  });

  it("falls back to a general failure for anything else", () => {
    expect(mapRegisterError(new ApiError(500, "INTERNAL", "boom"))).toEqual({ kind: "failed" });
    expect(mapRegisterError(new Error("network"))).toEqual({ kind: "failed" });
  });
});
