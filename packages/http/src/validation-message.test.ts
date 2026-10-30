// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validationMessage } from "./validation-message.js";

describe("validationMessage", () => {
  it("names each failing field and its problem", () => {
    const result = z.object({ name: z.string().min(1) }).safeParse({ name: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(validationMessage(result.error)).toContain("name:");
    }
  });

  it("uses a generic label when the failing value is the whole request", () => {
    const result = z.string().safeParse(42);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(validationMessage(result.error).startsWith("request:")).toBe(true);
    }
  });
});
