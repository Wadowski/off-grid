// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { eventDateSchema } from "./calendar-event-fields-schema.js";

describe("eventDateSchema", () => {
  it("accepts a date in the year 1000 or later", () => {
    expect(eventDateSchema.safeParse("1000-01-01").success).toBe(true);
    expect(eventDateSchema.safeParse("2026-11-20").success).toBe(true);
  });

  it("refuses years before 1000, so Date.UTC cannot map them to the 1900s", () => {
    expect(eventDateSchema.safeParse("0000-01-01").success).toBe(false);
    expect(eventDateSchema.safeParse("0099-12-31").success).toBe(false);
    expect(eventDateSchema.safeParse("0999-12-31").success).toBe(false);
  });

  it("still refuses a value that is not an ISO date", () => {
    expect(eventDateSchema.safeParse("2026-13-01").success).toBe(false);
  });
});
