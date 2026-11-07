// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { describe, expect, it } from "vitest";
import { mapResetError } from "./map-reset-error.js";

describe("mapResetError", () => {
  it("treats a wrong or expired recovery or emailed code as a code problem", () => {
    expect(mapResetError(new ApiError(400, "INVALID_RECOVERY_CODE", "x"))).toEqual({
      kind: "codeInvalid",
    });
    expect(mapResetError(new ApiError(400, "INVALID_RESET_CODE", "x"))).toEqual({
      kind: "codeInvalid",
    });
  });

  it("reports too many attempts as locked", () => {
    expect(mapResetError(new ApiError(429, "RECOVERY_LOCKED", "x"))).toEqual({ kind: "locked" });
  });

  it("points a rejected password at its field", () => {
    expect(mapResetError(new ApiError(400, "PASSWORD_TOO_SHORT", "x"))).toEqual({
      kind: "password",
      textId: "createAccount.passwordTooShort",
    });
  });

  it("treats anything else as a generic failure", () => {
    expect(mapResetError(new Error("network"))).toEqual({ kind: "failed" });
    expect(mapResetError(new ApiError(500, "INTERNAL", "x"))).toEqual({ kind: "failed" });
  });
});
