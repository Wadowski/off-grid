// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  breadcrumbSchema,
  driveSchema,
  fileDetailsSchema,
  fileListItemSchema,
  fileListSchema,
  fileListDirectionSchema,
  fileListSortSchema,
  fileSchema,
  moveFileResultSchema,
  filesErrorCodeSchema,
  familyMemberSchema,
  fileVersionSchema,
} from "@offgrid/contracts";
import type { DragEvent } from "react";
import type { FileKind } from "@offgrid/ui";
import type { ListStatus, SessionUser } from "../types.js";
import type { filesViewSchema } from "./files-view-preference-schema.js";

export type Drive = ReturnType<typeof driveSchema.parse>;
export type FileEntry = ReturnType<typeof fileSchema.parse>;
export type Breadcrumb = ReturnType<typeof breadcrumbSchema.parse>;
export type FileDetails = ReturnType<typeof fileDetailsSchema.parse>;
export type MoveFileResult = ReturnType<typeof moveFileResultSchema.parse>;
export type FileListPage = ReturnType<typeof fileListSchema.parse>;
export type FileListItem = ReturnType<typeof fileListItemSchema.parse>;
export type FilesErrorCode = (typeof filesErrorCodeSchema.options)[number];
export type SplitFileEntries = {
  readonly folders: readonly FileListItem[];
  readonly files: readonly FileListItem[];
};

export type FolderTarget =
  | { readonly kind: "drive"; readonly driveId: Drive["id"] }
  | { readonly kind: "folder"; readonly folderId: FileEntry["id"] };

export type FilesErrorTextId =
  | "files.errors.notFound"
  | "files.errors.validationFailed"
  | "files.errors.unauthenticated"
  | "files.errors.nameTaken"
  | "files.errors.invalidMove"
  | "files.errors.notTrashed"
  | "files.errors.isFolder"
  | "files.errors.uploadIncomplete"
  | "files.errors.uploadOffsetMismatch"
  | "files.errors.payloadTooLarge"
  | "files.errors.currentVersion"
  | "files.errors.failed";

export type CreateFolderStatus = "idle" | "submitting" | "failed";

export type MoveTarget = {
  readonly driveId: Drive["id"];
  readonly parentId: FileEntry["id"] | null;
};

export type MoveEntryStatus = "idle" | "moving" | "failed";

export type MoveEntryState = {
  readonly status: MoveEntryStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly move: (fileId: FileEntry["id"], target: MoveTarget) => Promise<MoveFileResult | null>;
};

export type CreateFolderState = {
  readonly status: CreateFolderStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly create: (name: string) => Promise<FileEntry | null>;
};

export type NewFolderDialogState = {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
};

export type DrivesState = {
  readonly drives: readonly Drive[];
  readonly status: ListStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly refresh: () => Promise<void>;
};

export type FolderContentsState = {
  readonly items: readonly FileListItem[];
  readonly status: ListStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly hasMore: boolean;
  readonly isLoadingMore: boolean;
  readonly loadMore: () => Promise<void>;
  readonly refresh: () => Promise<void>;
  readonly refreshQuietly: () => Promise<void>;
  readonly removeItem: (fileId: FileListItem["id"]) => void;
  readonly replaceItem: (entry: FileEntry) => void;
};

export type RenameEntryStatus = "idle" | "submitting" | "failed";

export type RenameEntryState = {
  readonly status: RenameEntryStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly rename: (fileId: FileEntry["id"], name: string) => Promise<FileEntry | null>;
};

export type TrashEntryStatus = "idle" | "pending" | "failed";

export type TrashEntryState = {
  readonly status: TrashEntryStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly trash: (fileId: FileEntry["id"]) => Promise<boolean>;
};

export type DriveTrashState = {
  readonly items: readonly FileListItem[];
  readonly status: ListStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly refresh: () => Promise<void>;
  readonly refreshQuietly: () => Promise<void>;
  readonly removeItem: (fileId: FileListItem["id"]) => void;
};

export type DriveTrashSnapshot = {
  readonly items: readonly FileListItem[];
  readonly status: ListStatus;
  readonly errorTextId: FilesErrorTextId | null;
};

export type RestoreEntryState = {
  readonly status: TrashEntryStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly restore: (fileId: FileEntry["id"]) => Promise<FileEntry | null>;
};

export type FolderContentsSnapshot = {
  readonly items: readonly FileListItem[];
  readonly nextCursor: string | null;
  readonly status: ListStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly isLoadingMore: boolean;
};

export type FileRowValues = {
  readonly name: string;
  readonly kind: FileKind;
  readonly modifiedAt: Date;
  readonly sizeBytes?: number;
  readonly itemCount?: number;
};

export type FileDetailsState = {
  readonly file: FileEntry | null;
  readonly breadcrumbs: readonly Breadcrumb[];
  readonly status: ListStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly refresh: () => Promise<void>;
  readonly refreshQuietly: () => Promise<void>;
};

export type CurrentFolderState = {
  readonly status: ListStatus | "not-found";
  readonly driveId: Drive["id"] | null;
  readonly folderId: FileEntry["id"] | null;
  readonly breadcrumbs: readonly Breadcrumb[];
  readonly errorTextId: FilesErrorTextId | null;
  readonly refresh: () => Promise<void>;
};

export type FilesSortField = (typeof fileListSortSchema.options)[number];
export type FilesSortDirection = (typeof fileListDirectionSchema.options)[number];

export type FilesSortOrder = {
  readonly sort: FilesSortField;
  readonly direction: FilesSortDirection;
};

export type FilesView = (typeof filesViewSchema.options)[number];

export type FilesViewPreference = FilesSortOrder & {
  readonly view: FilesView;
};

export type FilesViewPreferenceState = {
  readonly preference: FilesViewPreference;
  readonly updatePreference: (change: Partial<FilesViewPreference>) => void;
};

export type FileListOptions = Partial<FilesSortOrder> & {
  readonly cursor?: string;
  readonly limit?: number;
};

export type TrashListOptions = Pick<FileListOptions, "cursor" | "limit">;

export type RegularFileEntry = Extract<FileEntry, { readonly isFolder: false }>;

export type FileDetailsValues = {
  readonly name: string;
  readonly kind: FileKind;
  readonly sizeBytes: number;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type FileBackTarget = {
  readonly to: string;
  readonly name: string;
};

export type FileVersion = ReturnType<typeof fileVersionSchema.parse>;
export type FamilyMemberEntry = ReturnType<typeof familyMemberSchema.parse>;

export type FileVersionsState = {
  readonly versions: readonly FileVersion[];
  readonly status: ListStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly refresh: () => Promise<void>;
  readonly refreshQuietly: () => Promise<void>;
};

export type FileVersionRow = {
  readonly id: FileVersion["id"];
  readonly number: number;
  readonly sizeBytes: number;
  readonly createdAt: Date;
  readonly authorName: string | null;
  readonly isCurrent: boolean;
};

export type FileVersionCompletion = {
  readonly kind: "restored" | "deleted" | "downloaded";
  readonly versionNumber: number;
};

export type FileVersionActionsState = {
  readonly pendingVersionId: FileVersion["id"] | null;
  readonly errorTextId: FilesErrorTextId | null;
  readonly completed: FileVersionCompletion | null;
  readonly restore: (version: FileVersionRow) => Promise<void>;
  readonly remove: (version: FileVersionRow) => Promise<void>;
  readonly download: (version: FileVersionRow, fileName: string) => Promise<void>;
};

export type FamilyMembersState = {
  readonly members: readonly FamilyMemberEntry[];
  readonly status: ListStatus;
  readonly refresh: () => Promise<void>;
};

export type FileAccessRole = "owner" | "admin" | "member";

export type FileAccessEntry = {
  readonly userId: string;
  readonly name: string | null;
  readonly role: FileAccessRole;
};

export type FileActivityEntry = {
  readonly id: FileVersion["id"];
  readonly number: number;
  readonly createdAt: Date;
  readonly name: string | null;
};

export type FileDetailsScreenState = {
  readonly details: FileDetailsState;
  readonly versions: FileVersionsState;
  readonly drive: Drive | null;
  readonly drivesStatus: ListStatus;
  readonly members: readonly FamilyMemberEntry[];
  readonly membersStatus: ListStatus;
  readonly refreshMembers: () => Promise<void>;
  readonly viewer: SessionUser | null;
};

export type PreviewKind = "image" | "pdf";

export type FileContentState =
  | { readonly status: "loading" }
  | { readonly status: "failed"; readonly errorTextId: FilesErrorTextId }
  | { readonly status: "unsupported" }
  | { readonly status: "ready"; readonly kind: PreviewKind; readonly objectUrl: string };

export type FileContent = {
  readonly state: FileContentState;
  readonly retry: () => void;
};

export type FileDownloadStatus = "idle" | "downloading" | "failed";

export type FileDownload = {
  readonly status: FileDownloadStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly download: () => Promise<void>;
};

export type FolderNodeState = {
  readonly driveId: Drive["id"];
  readonly folderId: FileEntry["id"] | null;
  readonly status: ListStatus;
  readonly folders: readonly FileListItem[];
  readonly nextCursor: string | null;
  readonly isLoadingMore: boolean;
  readonly errorTextId: FilesErrorTextId | null;
};

export type FolderTreeNodeRef = {
  readonly id: string;
  readonly driveId: Drive["id"];
  readonly folderId: FileEntry["id"] | null;
};

export type FolderTreeState = {
  readonly nodes: Readonly<Record<string, FolderNodeState>>;
  readonly expandedIds: ReadonlySet<string>;
  readonly toggle: (node: FolderTreeNodeRef) => void;
  readonly reload: (node: FolderTreeNodeRef) => void;
  readonly loadMore: (node: FolderTreeNodeRef) => void;
};

export type FolderPickerCaption = "currentLocation" | "otherOwner";

export type FolderPickerNode = {
  readonly id: string;
  readonly driveId: Drive["id"];
  readonly folderId: FileEntry["id"] | null;
  readonly label: string;
  readonly isDrive: boolean;
  readonly hasChildren: boolean;
  readonly disabled: boolean;
  readonly isCurrent: boolean;
  readonly caption: FolderPickerCaption | null;
  readonly children?: readonly FolderPickerNode[];
};

export type MoveDialogStep = "idle" | "confirmingCrossOwner" | "moving";

export type MoveSource = {
  readonly entryId: FileEntry["id"];
  readonly entryName: string;
  readonly driveId: Drive["id"];
  readonly parentId: FileEntry["id"] | null;
};

export type MoveNotice = {
  readonly entryName: string;
  readonly targetName: string;
  readonly crossOwnerNotice: boolean;
};

export type MoveDialogState = {
  readonly nodes: readonly FolderPickerNode[];
  readonly tree: FolderTreeState;
  readonly selectedId: string | null;
  readonly step: MoveDialogStep;
  readonly errorTextId: FilesErrorTextId | null;
  readonly canMove: boolean;
  readonly isCrossOwner: boolean;
  readonly select: (id: string) => void;
  readonly expand: (id: string) => void;
  readonly retry: (id: string) => void;
  readonly loadMore: (id: string) => void;
  readonly submit: () => Promise<void>;
};

export type FileDragState = {
  readonly isDragging: boolean;
  readonly onDragEnter: (event: DragEvent<HTMLElement>) => void;
  readonly onDragOver: (event: DragEvent<HTMLElement>) => void;
  readonly onDragLeave: (event: DragEvent<HTMLElement>) => void;
  readonly onDrop: (event: DragEvent<HTMLElement>) => void;
};
