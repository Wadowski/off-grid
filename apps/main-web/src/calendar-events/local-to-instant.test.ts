// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { localToInstant } from "./local-to-instant.js";

describe("localToInstant", () => {
  it("converts a summer time in Europe/Warsaw to UTC with the summer offset", () => {
    expect(localToInstant("2026-07-01", "12:00", "Europe/Warsaw")).toBe("2026-07-01T10:00:00.000Z");
  });

  it("converts a winter time in Europe/Warsaw to UTC with the winter offset", () => {
    expect(localToInstant("2026-12-01", "12:00", "Europe/Warsaw")).toBe("2026-12-01T11:00:00.000Z");
  });

  it("uses the offset before the spring daylight-saving switch on the switch day", () => {
    expect(localToInstant("2026-03-29", "01:30", "Europe/Warsaw")).toBe("2026-03-29T00:30:00.000Z");
  });

  it("uses the offset after the spring daylight-saving switch on the switch day", () => {
    expect(localToInstant("2026-03-29", "03:30", "Europe/Warsaw")).toBe("2026-03-29T01:30:00.000Z");
  });

  it("returns undefined for an incomplete date or time", () => {
    expect(localToInstant("", "12:00", "Europe/Warsaw")).toBeUndefined();
    expect(localToInstant("2026-07-01", "", "Europe/Warsaw")).toBeUndefined();
  });
});
