// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { familyMemberAddedV1 } from "@offgrid/contracts";
import type { ModuleDatabase } from "@offgrid/db";
import { describe, expect, it } from "vitest";
import { createFamilyMembershipHandler } from "./create-family-membership-handler.js";
import { fakeTransaction } from "../test/fake-transaction.js";
import type { FamilyMembershipEvent, FamilyMembershipStore } from "./types.js";

const fakeDatabase = (): ModuleDatabase =>
  ({
    $transaction: async <Result>(callback: (tx: unknown) => Promise<Result>) =>
      callback(fakeTransaction()),
  }) as unknown as ModuleDatabase;

const joinedEvent = (familyId: string | null, sourceVersion: number): FamilyMembershipEvent =>
  ({
    ...familyMemberAddedV1.envelope.parse({
      id: randomUUID(),
      type: familyMemberAddedV1.name,
      version: 1,
      occurredAt: new Date().toISOString(),
      traceId: randomUUID(),
      familyId,
      sourceVersion,
      payload: { userId: randomUUID(), role: "member" },
    }),
    userId: null,
  }) as FamilyMembershipEvent;

const recordingStore = () => {
  const writes: boolean[] = [];
  const store: FamilyMembershipStore = {
    findStored: async () => null,
    write: async (_tx, _change, isMember) => {
      writes.push(isMember);
    },
  };
  return { store, writes };
};

describe("createFamilyMembershipHandler", () => {
  it("applies a joined event through the store it was created with", async () => {
    const { store, writes } = recordingStore();

    await createFamilyMembershipHandler(store)(fakeDatabase(), joinedEvent(randomUUID(), 1));

    expect(writes).toEqual([true]);
  });

  it("refuses an event without a family before it writes", async () => {
    const { store, writes } = recordingStore();

    await expect(
      createFamilyMembershipHandler(store)(fakeDatabase(), joinedEvent(null, 1)),
    ).rejects.toThrow("family membership event has no family");
    expect(writes).toEqual([]);
  });
});
