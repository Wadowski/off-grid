// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import { describe, expect, it } from "vitest";
import { membershipChangeOf } from "./membership-change-of.js";
import type { FamilyMembershipEvent } from "./types.js";

const familyId = randomUUID();
const userId = randomUUID();

const envelopeOf = (
  definition: typeof familyMemberAddedV1 | typeof familyMemberRemovedV1,
  familyScope: string | null,
): FamilyMembershipEvent =>
  ({
    ...definition.envelope.parse({
      id: randomUUID(),
      type: definition.name,
      version: definition.version,
      occurredAt: new Date().toISOString(),
      traceId: randomUUID(),
      familyId: familyScope,
      sourceVersion: 2,
      payload: definition === familyMemberAddedV1 ? { userId, role: "member" } : { userId },
    }),
    userId: null,
  }) as FamilyMembershipEvent;

describe("membershipChangeOf", () => {
  it("maps a joined event to a membership change that sets the member flag", () => {
    expect(membershipChangeOf(envelopeOf(familyMemberAddedV1, familyId))).toEqual({
      familyId,
      userId,
      sourceVersion: 2,
      isMember: true,
    });
  });

  it("maps a removed event to a membership change that clears the member flag", () => {
    expect(membershipChangeOf(envelopeOf(familyMemberRemovedV1, familyId))).toEqual({
      familyId,
      userId,
      sourceVersion: 2,
      isMember: false,
    });
  });

  it("refuses an event that has no family", () => {
    expect(() => membershipChangeOf(envelopeOf(familyMemberAddedV1, null))).toThrow(
      "family membership event has no family",
    );
  });
});
