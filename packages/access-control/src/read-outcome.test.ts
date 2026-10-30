// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { readOutcome } from "./read-outcome.js";
import type { AccessGroup, Resource, Subject } from "./types.js";

const family: AccessGroup = { id: "5c2d1e0f-9a8b-4c7d-8e6f-1a2b3c4d5e6f", kind: "family" };
const resource: Resource = { owner: family, grants: [] };
const member: Subject = { userId: "11111111-1111-4111-8111-111111111111", groups: [family] };
const stranger: Subject = { userId: "22222222-2222-4222-8222-222222222222", groups: [] };

describe("readOutcome", () => {
  it("reports not-found when there is no value, whoever asks", () => {
    expect(readOutcome({ value: null, subject: member, resource })).toEqual({
      outcome: "not-found",
    });
  });

  it("returns the value to a member of the owning group", () => {
    expect(readOutcome({ value: "Novak family", subject: member, resource })).toEqual({
      outcome: "found",
      value: "Novak family",
    });
  });

  it("denies a value to a subject outside the owning group", () => {
    expect(readOutcome({ value: "Novak family", subject: stranger, resource })).toEqual({
      outcome: "forbidden",
    });
  });
});
