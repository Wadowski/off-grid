// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileStorage, StoredObject } from "@offgrid/file-storage";
import type { ModuleDatabase } from "@offgrid/db";
import type { EventBus } from "@offgrid/event-bus";
import type { CurrentUserId } from "@offgrid/http";
import type { Logger } from "@offgrid/observability";

export interface StorageIntegrityReport {
  readonly orphanKeys: readonly string[];
  readonly missingKeys: readonly string[];
  readonly orphanCount: number;
  readonly missingCount: number;
  readonly checkedRowCount: number;
  readonly checkedObjectCount: number;
}

export interface FilesModuleOptions {
  readonly directory: string;
  readonly maxUploadBytes: number;
}

export interface FilesSubscriberContext {
  readonly eventBus: EventBus;
  readonly db: ModuleDatabase;
}

export interface FilesWorkerContext {
  readonly db: ModuleDatabase;
  readonly logger: Logger;
}

export interface FilesWorker {
  readonly name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface StorageIntegritySweepOptions {
  readonly db: ModuleDatabase;
  readonly storage: FileStorage;
  readonly logger: Logger;
  readonly now: () => Date;
  readonly intervalMs: number;
  readonly firstRunDelayMs: number;
}

export interface DriveInsertInput {
  readonly driveId: string;
  readonly name: string;
}

export interface PersonalDriveInsertInput extends DriveInsertInput {
  readonly userId: string;
}

export interface FamilyDriveInsertInput extends DriveInsertInput {
  readonly familyId: string;
}

export interface DriveCreatedInput {
  readonly driveId: string;
  readonly ownerUserId: string | null;
  readonly ownerFamilyId: string | null;
}

export interface FilesRouteContext {
  readonly db: ModuleDatabase;
  readonly currentUserId: CurrentUserId;
  readonly storage: FileStorage;
  readonly maxUploadBytes: number;
}

export interface DriveRecord {
  readonly driveId: string;
  readonly userId: string | null;
  readonly familyId: string | null;
  readonly name: string;
  readonly createdAt: Date;
}

export interface FileRecord {
  readonly fileId: string;
  readonly driveId: string;
  readonly parentId: string | null;
  readonly name: string;
  readonly isFolder: boolean;
  readonly mimeType: string | null;
  readonly sizeBytes: bigint | null;
  readonly currentVersionId: string | null;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

export interface ChildrenCursor {
  readonly isFolder: boolean;
  readonly name: string;
  readonly fileId: string;
}

export interface ChildrenQuery {
  readonly cursor: ChildrenCursor | null;
  readonly limit: number;
}

export interface ChildrenPage {
  readonly records: readonly FileRecord[];
  readonly nextCursor: ChildrenCursor | null;
}

export type BreadcrumbRecord =
  | { readonly kind: "drive"; readonly id: string; readonly name: string }
  | { readonly kind: "folder"; readonly id: string; readonly name: string };

export type FilesOutcome<Value> =
  { readonly outcome: "found"; readonly value: Value } | { readonly outcome: "not-found" };

export interface ListedChildren {
  readonly page: ChildrenPage;
  readonly itemCounts: ReadonlyMap<string, number>;
  readonly breadcrumbs: readonly BreadcrumbRecord[];
}

export interface FileDetails {
  readonly file: FileRecord;
  readonly breadcrumbs: readonly BreadcrumbRecord[];
}

export interface FileOwner {
  readonly userId: string | null;
  readonly familyId: string | null;
}

export interface FileEventInput {
  readonly file: FileRecord;
  readonly owner: FileOwner;
}

export interface NewFolderInput {
  readonly fileId: string;
  readonly driveId: string;
  readonly parentId: string | null;
  readonly name: string;
  readonly owner: FileOwner;
}

export interface FileUpdateInput {
  readonly name?: string;
  readonly parentId?: string | null;
  readonly updatedAt: Date;
}

export interface CreateFolderInput {
  readonly parentId: string | null;
  readonly name: string;
}

export interface MoveFileInput {
  readonly driveId: string;
  readonly parentId: string | null;
}

export interface MoveOutcome {
  readonly file: FileRecord;
  readonly crossOwnerNotice: boolean;
}

export interface CopyPlanEntry {
  readonly sourceFileId: string;
  readonly copyFileId: string;
  readonly copyParentId: string | null;
}

export interface NewFileVersionInput {
  readonly versionId: string;
  readonly fileId: string;
  readonly owner: FileOwner;
  readonly number: number;
  readonly storageKey: string;
  readonly sizeBytes: bigint;
  readonly mimeType: string;
  readonly sha256: string;
  readonly createdByUserId: string;
}

export interface FileVersionRecord {
  readonly versionId: string;
  readonly fileId: string;
  readonly storageKey: string;
  readonly sizeBytes: bigint;
  readonly mimeType: string;
  readonly sha256: string;
}

export interface SourceTree {
  readonly entries: readonly FileRecord[];
  readonly versions: readonly FileVersionRecord[];
}

export interface SameDrivePlan {
  readonly kind: "same-drive";
  readonly file: FileRecord;
  readonly owner: FileOwner;
  readonly parentId: string | null;
}

export interface CrossOwnerPlan {
  readonly kind: "cross-owner";
  readonly file: FileRecord;
  readonly sourceOwner: FileOwner;
  readonly target: DriveRecord;
  readonly parentId: string | null;
  readonly tree: SourceTree;
}

export type MovePlan =
  { readonly kind: "no-op"; readonly file: FileRecord } | SameDrivePlan | CrossOwnerPlan;

export interface SiblingNameQuery {
  readonly driveId: string;
  readonly parentId: string | null;
  readonly name: string;
  readonly excludeFileId: string;
}

export interface UploadTarget {
  readonly driveId: string;
  readonly parentId: string | null;
  readonly name: string;
}

export interface UploadFileInput extends UploadTarget {
  readonly mimeType: string;
  readonly body: AsyncIterable<Uint8Array>;
  readonly signal: AbortSignal;
}

export interface UploadFileDependencies {
  readonly db: ModuleDatabase;
  readonly storage: FileStorage;
  readonly maxUploadBytes: number;
}

export interface RecordUploadInput extends UploadTarget {
  readonly mimeType: string;
  readonly stored: StoredObject;
}

export interface NewRegularFileInput {
  readonly fileId: string;
  readonly driveId: string;
  readonly parentId: string | null;
  readonly name: string;
  readonly mimeType: string;
  readonly sizeBytes: bigint;
  readonly currentVersionId: string;
  readonly owner: FileOwner;
}
