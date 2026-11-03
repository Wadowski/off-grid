// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { normalizePassword } from "./normalize-password.js";

describe("normalizePassword", () => {
  it("applies Unicode NFKC so visually equal passwords match", () => {
    expect(normalizePassword("ｆｕｌｌｗｉｄｔｈ-pass")).toBe("fullwidth-pass");
  });
});
