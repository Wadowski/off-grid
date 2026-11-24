// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toUploadPercent } from "./to-upload-percent.js";

describe("toUploadPercent", () => {
  it("returns the whole percent of the bytes sent", () => {
    expect(toUploadPercent(1, 3)).toBe(33);
    expect(toUploadPercent(3, 3)).toBe(100);
  });

  it("returns zero when the total is unknown", () => {
    expect(toUploadPercent(10, 0)).toBe(0);
  });
});
