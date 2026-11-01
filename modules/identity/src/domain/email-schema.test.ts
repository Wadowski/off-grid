// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { emailSchema } from "./email-schema.js";

describe("emailSchema", () => {
  it("accepts a well-formed address", () => {
    expect(emailSchema.parse("ada@example.com")).toBe("ada@example.com");
  });

  it("rejects text that is not an address", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });

  it("rejects an address longer than 254 characters", () => {
    const local = "a".repeat(250);

    expect(emailSchema.safeParse(`${local}@example.com`).success).toBe(false);
  });
});
