// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isValidEventWindow } from "./is-valid-event-window.js";

describe("isValidEventWindow", () => {
  const start = new Date("2026-11-20T09:00:00Z");

  it("refuses an end before the start", () => {
    expect(isValidEventWindow({ startsAt: start, endsAt: new Date("2026-11-20T08:59:59Z") })).toBe(
      false,
    );
  });

  it("allows an end equal to the start", () => {
    expect(isValidEventWindow({ startsAt: start, endsAt: start })).toBe(true);
  });

  it("allows an end after the start", () => {
    expect(isValidEventWindow({ startsAt: start, endsAt: new Date("2026-11-20T10:00:00Z") })).toBe(
      true,
    );
  });
});
