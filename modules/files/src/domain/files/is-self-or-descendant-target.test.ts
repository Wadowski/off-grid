// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isSelfOrDescendantTarget } from "./is-self-or-descendant-target.js";

const MOVED = "11111111-1111-4111-8111-111111111111";
const TARGET = "22222222-2222-4222-8222-222222222222";
const TARGET_PARENT = "33333333-3333-4333-8333-333333333333";
const UNRELATED = "44444444-4444-4444-8444-444444444444";

describe("isSelfOrDescendantTarget", () => {
  it("refuses a move into the folder itself", () => {
    expect(isSelfOrDescendantTarget(MOVED, [MOVED])).toBe(true);
  });

  it("refuses a move into a folder inside the moved folder", () => {
    expect(isSelfOrDescendantTarget(MOVED, [TARGET, MOVED])).toBe(true);
  });

  it("refuses a move into a deeper descendant of the moved folder", () => {
    expect(isSelfOrDescendantTarget(MOVED, [TARGET, TARGET_PARENT, MOVED])).toBe(true);
  });

  it("allows a move into a folder that is not under the moved folder", () => {
    expect(isSelfOrDescendantTarget(MOVED, [TARGET, TARGET_PARENT])).toBe(false);
  });

  it("allows a move to the drive root, where the target path is empty", () => {
    expect(isSelfOrDescendantTarget(MOVED, [])).toBe(false);
  });

  it("allows a move when the moved folder is unrelated to the target path", () => {
    expect(isSelfOrDescendantTarget(UNRELATED, [TARGET])).toBe(false);
  });
});
