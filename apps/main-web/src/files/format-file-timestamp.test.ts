// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { formatFileTimestamp } from "./format-file-timestamp.js";

describe("formatFileTimestamp", () => {
  it("formats a date with a time in the given language", () => {
    const formatted = formatFileTimestamp(new Date(2026, 2, 4, 15, 30), "en-US");

    expect(formatted).toContain("2026");
    expect(formatted).toContain("Mar");
    expect(formatted).toMatch(/3:30/);
  });
});
