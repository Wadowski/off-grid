// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { normalizeAppPassword } from "./normalize-app-password.js";

describe("normalizeAppPassword", () => {
  it("removes the spaces that Gmail shows in its app passwords", () => {
    expect(normalizeAppPassword("gmail", "abcd efgh ijkl mnop")).toBe("abcdefghijklmnop");
  });

  it("removes the hyphens that iCloud shows in its app passwords", () => {
    expect(normalizeAppPassword("icloud", "abcd-efgh-ijkl-mnop")).toBe("abcdefghijklmnop");
  });

  it("keeps hyphens for other providers", () => {
    expect(normalizeAppPassword("fastmail", "pass-word-1")).toBe("pass-word-1");
  });
});
