// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase, ModuleTransaction } from "@offgrid/db";
import type { familyMemberAddedV1, familyMemberRemovedV1 } from "@offgrid/contracts";
import type { EventOf } from "@offgrid/event-bus";

export interface MembershipChange {
  readonly familyId: string;
  readonly userId: string;
  readonly sourceVersion: number;
  readonly isMember: boolean;
}

export interface StoredMembership {
  readonly sourceVersion: number;
}

export type MembershipVersionDecision = "skip" | { readonly isMember: boolean };

export interface FamilyMembershipStore {
  findStored(
    tx: ModuleTransaction,
    familyId: string,
    userId: string,
  ): Promise<StoredMembership | null>;
  write(tx: ModuleTransaction, change: MembershipChange, isMember: boolean): Promise<void>;
}

export type FamilyMembershipEvent =
  EventOf<typeof familyMemberAddedV1> | EventOf<typeof familyMemberRemovedV1>;

export type FamilyMembershipHandler = (
  db: ModuleDatabase,
  event: FamilyMembershipEvent,
) => Promise<void>;
