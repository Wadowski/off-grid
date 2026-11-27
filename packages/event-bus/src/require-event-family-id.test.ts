// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { EventWithoutFamilyError } from "./event-without-family-error.js";
import { requireEventFamilyId } from "./require-event-family-id.js";

describe("requireEventFamilyId", () => {
  it("returns the family id when the event carries one", () => {
    expect(requireEventFamilyId("0f6c2a7e-8d3b-4c2a-9a1e-5b7d9c0e1f2a")).toBe(
      "0f6c2a7e-8d3b-4c2a-9a1e-5b7d9c0e1f2a",
    );
  });

  it("throws EventWithoutFamilyError when the event has no family id", () => {
    expect(() => requireEventFamilyId(null)).toThrow(EventWithoutFamilyError);
  });
});
