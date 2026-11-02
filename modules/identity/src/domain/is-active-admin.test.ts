// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isActiveAdmin } from "./is-active-admin.js";

describe("isActiveAdmin", () => {
  it("accepts only an active admin", () => {
    expect(isActiveAdmin({ instanceRole: "admin", status: "active" })).toBe(true);
    expect(isActiveAdmin({ instanceRole: "admin", status: "disabled" })).toBe(false);
    expect(isActiveAdmin({ instanceRole: "user", status: "active" })).toBe(false);
  });
});
