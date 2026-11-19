// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { applyMembershipChange } from "./apply-membership-change.js";
import { fakeTransaction } from "../test/fake-transaction.js";
import type { FamilyMembershipStore, MembershipChange, StoredMembership } from "./types.js";

const familyId = randomUUID();
const userId = randomUUID();

const memoryStore = (initial: StoredMembership | null = null) => {
  const written: { change: MembershipChange; isMember: boolean }[] = [];
  let stored = initial;
  const store: FamilyMembershipStore = {
    findStored: async () => stored,
    write: async (_tx, change, isMember) => {
      written.push({ change, isMember });
      stored = { sourceVersion: change.sourceVersion };
    },
  };
  return { store, written };
};

const change = (sourceVersion: number, isMember: boolean): MembershipChange => ({
  familyId,
  userId,
  sourceVersion,
  isMember,
});

describe("applyMembershipChange", () => {
  it("writes the decided membership for a first join", async () => {
    const { store, written } = memoryStore();

    await applyMembershipChange(fakeTransaction(), change(1, true), store);

    expect(written).toEqual([{ change: change(1, true), isMember: true }]);
  });

  it("writes nothing for a duplicate version", async () => {
    const { store, written } = memoryStore({ sourceVersion: 1 });

    await applyMembershipChange(fakeTransaction(), change(1, true), store);

    expect(written).toEqual([]);
  });

  it("writes the removal for the next version", async () => {
    const { store, written } = memoryStore({ sourceVersion: 1 });

    await applyMembershipChange(fakeTransaction(), change(2, false), store);

    expect(written).toEqual([{ change: change(2, false), isMember: false }]);
  });

  it("does not write when a version arrives out of order", async () => {
    const { store, written } = memoryStore({ sourceVersion: 1 });

    await expect(
      applyMembershipChange(fakeTransaction(), change(3, true), store),
    ).rejects.toThrow("arrived before an earlier change");
    expect(written).toEqual([]);
  });
});
