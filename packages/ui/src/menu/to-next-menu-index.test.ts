// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toNextMenuIndex } from "./to-next-menu-index.js";

describe("toNextMenuIndex", () => {
  it("moves down and wraps to the first item", () => {
    expect(toNextMenuIndex("ArrowDown", 0, 3)).toBe(1);
    expect(toNextMenuIndex("ArrowDown", 2, 3)).toBe(0);
  });

  it("moves up and wraps to the last item", () => {
    expect(toNextMenuIndex("ArrowUp", 2, 3)).toBe(1);
    expect(toNextMenuIndex("ArrowUp", 0, 3)).toBe(2);
  });

  it("starts at the first item going down and at the last going up when nothing is focused", () => {
    expect(toNextMenuIndex("ArrowDown", -1, 3)).toBe(0);
    expect(toNextMenuIndex("ArrowUp", -1, 3)).toBe(2);
  });

  it("jumps to the first and last items with Home and End", () => {
    expect(toNextMenuIndex("Home", 2, 3)).toBe(0);
    expect(toNextMenuIndex("End", 0, 3)).toBe(2);
  });

  it("returns null for other keys and for an empty menu", () => {
    expect(toNextMenuIndex("Enter", 0, 3)).toBeNull();
    expect(toNextMenuIndex("ArrowDown", 0, 0)).toBeNull();
  });
});
