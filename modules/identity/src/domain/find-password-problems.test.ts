// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { findPasswordProblems } from "./find-password-problems.js";

const STRONG = "correct horse battery staple";

describe("findPasswordProblems", () => {
  it("accepts a long password with no personal data and no common password", () => {
    expect(findPasswordProblems(STRONG, ["anna", "anna smith"])).toEqual([]);
  });

  it("rejects a password shorter than 12 characters", () => {
    expect(findPasswordProblems("short-pass", [])).toEqual(["PASSWORD_TOO_SHORT"]);
  });

  it("counts characters, not UTF-16 units, when checking the minimum", () => {
    expect(findPasswordProblems("😀😀😀😀😀😀😀😀😀😀😀😀", [])).toEqual([]);
    expect(findPasswordProblems("😀😀😀😀😀😀😀😀😀😀😀", [])).toEqual(["PASSWORD_TOO_SHORT"]);
  });

  it("rejects a password longer than 128 characters", () => {
    expect(findPasswordProblems("a".repeat(129), [])).toEqual(["PASSWORD_TOO_LONG"]);
  });

  it("rejects a very common password ignoring case", () => {
    expect(findPasswordProblems("Password1234", [])).toEqual(["PASSWORD_TOO_COMMON"]);
  });

  it("rejects a password that contains the email local part or display name, ignoring case", () => {
    expect(findPasswordProblems("MyANNAsecret-pass", ["anna", "anna smith"])).toEqual([
      "PASSWORD_CONTAINS_PERSONAL_DATA",
    ]);
  });

  it("reports every problem it finds", () => {
    expect(findPasswordProblems("Password1234", ["password1234"])).toEqual([
      "PASSWORD_TOO_COMMON",
      "PASSWORD_CONTAINS_PERSONAL_DATA",
    ]);
  });
});
