// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { FileStorage } from "@offgrid/file-storage";
import type { Client, Pool } from "pg";

export interface FilesTestDatabase {
  readonly admin: Client;
  readonly pool: Pool;
  readonly db: ModuleDatabase;
  reset(): Promise<void>;
  stop(): Promise<void>;
}

export type SeedScope = "user" | "family";

export interface FamilyMembershipRow {
  readonly source_version: number;
  readonly is_member: boolean;
}

export interface DriveRow {
  readonly drive_id: string;
  readonly family_id: string | null;
  readonly user_id: string | null;
  readonly kind: string;
  readonly name: string;
}

export interface DriveCreatedEventRow {
  readonly sequence: string;
  readonly payload: { driveId: string; ownerUserId: string | null; ownerFamilyId: string | null };
}

export interface SeedOwner {
  readonly userId: string | null;
  readonly familyId: string | null;
}

export interface SeedEntryInput {
  readonly driveId: string;
  readonly owner: SeedOwner;
  readonly parentId: string | null;
  readonly name: string;
  readonly trashed?: boolean;
}

export interface SeedRegularFileInput extends SeedEntryInput {
  readonly sizeBytes: number;
  readonly createdByUserId: string;
  readonly storageKey?: string;
}

export interface FilesTestAppOptions {
  readonly storage?: FileStorage;
  readonly maxUploadBytes?: number;
}
