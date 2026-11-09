// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { testFailureTextIdOf } from "./constants.js";

describe("testFailureTextIdOf", () => {
  it("explains a rejected password", () => {
    expect(testFailureTextIdOf("MAIL_TEST_AUTH_REJECTED")).toBe("admin.testEmailAuthRejected");
  });

  it("explains an unreachable mail server", () => {
    expect(testFailureTextIdOf("MAIL_TEST_UNREACHABLE")).toBe("admin.testEmailUnreachable");
  });

  it("falls back to the generic failure for an unknown code", () => {
    expect(testFailureTextIdOf("SOMETHING_ELSE")).toBe("admin.testEmailFailed");
    expect(testFailureTextIdOf(undefined)).toBe("admin.testEmailFailed");
  });
});
