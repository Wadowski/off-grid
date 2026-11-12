// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { describe, expect, it } from "vitest";
import { toCalendarErrorTextId } from "./to-calendar-error-text-id.js";

describe("toCalendarErrorTextId", () => {
  it("maps a 404 to the not-found text", () => {
    expect(toCalendarErrorTextId(new ApiError(404, "NOT_FOUND", "not found"))).toBe(
      "calendar.errors.notFound",
    );
  });

  it("maps a 409 with DEFAULT_CALENDAR to the default-calendar text", () => {
    expect(toCalendarErrorTextId(new ApiError(409, "DEFAULT_CALENDAR", "default"))).toBe(
      "calendar.errors.defaultCalendar",
    );
  });

  it("maps a 409 with another code to the generic text", () => {
    expect(toCalendarErrorTextId(new ApiError(409, "CONFLICT", "conflict"))).toBe(
      "calendar.errors.failed",
    );
  });

  it("maps other API errors to the generic text", () => {
    expect(toCalendarErrorTextId(new ApiError(500, "INTERNAL", "boom"))).toBe(
      "calendar.errors.failed",
    );
  });

  it("maps a network failure to the generic text", () => {
    expect(toCalendarErrorTextId(new TypeError("Failed to fetch"))).toBe("calendar.errors.failed");
  });
});
