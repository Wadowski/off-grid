// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { initialInstanceRole } from "./initial-instance-role.js";

describe("initialInstanceRole", () => {
  it("makes the first user an admin", () => {
    expect(initialInstanceRole(0)).toBe("admin");
  });

  it("makes every later user a regular user", () => {
    expect(initialInstanceRole(1)).toBe("user");
    expect(initialInstanceRole(5)).toBe("user");
  });
});
