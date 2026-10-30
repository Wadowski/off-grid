// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isMemberOf } from "./is-member-of.js";
import type { AccessGroup, Subject } from "./types.js";

const id = "5c2d1e0f-9a8b-4c7d-8e6f-1a2b3c4d5e6f";
const family: AccessGroup = { id, kind: "family" };
const userGroup: AccessGroup = { id, kind: "user" };
const subject: Subject = { userId: "11111111-1111-4111-8111-111111111111", groups: [family] };

describe("isMemberOf", () => {
  it("matches a group with the same id and kind", () => {
    expect(isMemberOf(subject, family)).toBe(true);
  });

  it("does not match a group that shares the id but has another kind", () => {
    expect(isMemberOf(subject, userGroup)).toBe(false);
  });
});
