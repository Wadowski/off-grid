// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { findEmailError } from "./find-email-error.js";

describe("findEmailError", () => {
  it("accepts a plausible email", () => {
    expect(findEmailError(" anna@example.com ")).toBeUndefined();
  });

  it("asks for a valid email otherwise", () => {
    expect(findEmailError("not-an-email")).toBe("signIn.emailInvalid");
  });
});
