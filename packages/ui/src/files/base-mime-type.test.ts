// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { baseMimeType } from "./base-mime-type.js";

describe("baseMimeType", () => {
  it("drops parameters and normalises case and spaces", () => {
    expect(baseMimeType(" Text/Plain ; charset=UTF-8")).toBe("text/plain");
  });

  it("returns an empty string for an empty value", () => {
    expect(baseMimeType("")).toBe("");
  });
});
