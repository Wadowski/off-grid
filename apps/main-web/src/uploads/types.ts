// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Dispatch, ReactNode } from "react";
import type { Drive, FileEntry, FilesErrorTextId } from "../files/types.js";

export type UploadStatus = "queued" | "uploading" | "done" | "failed";

export type UploadErrorTextId = FilesErrorTextId | "files.upload.stoppedFamilySwitch";

export type UploadAnnouncementTextId =
  "files.upload.announceStart" | "files.upload.announceDone" | "files.upload.announceFailed";

export type UploadTarget = {
  readonly driveId: Drive["id"];
  readonly folderId: FileEntry["id"] | null;
};

export type VersionUploadTarget = UploadTarget & {
  readonly fileId: FileEntry["id"];
};

export type UploadItem = {
  readonly id: string;
  readonly familyId: string | null;
  readonly name: string;
  readonly sizeBytes: number;
  readonly mimeType: string;
  readonly driveId: Drive["id"];
  readonly folderId: FileEntry["id"] | null;
  readonly fileId: FileEntry["id"] | null;
  readonly status: UploadStatus;
  readonly percent: number;
  readonly errorTextId: UploadErrorTextId | null;
  readonly file: File | null;
};

export type UploadDone = {
  readonly itemId: string;
  readonly driveId: Drive["id"];
  readonly folderId: FileEntry["id"] | null;
  readonly fileId: FileEntry["id"] | null;
};

export type UploadAnnouncement = {
  readonly sequence: number;
  readonly textId: UploadAnnouncementTextId;
  readonly name: string;
  readonly reasonTextId: UploadErrorTextId | null;
};

export type UploadQueueState = {
  readonly items: readonly UploadItem[];
  readonly lastDone: UploadDone | null;
  readonly announcement: UploadAnnouncement | null;
};

export type UploadQueueAction =
  | { readonly type: "enqueued"; readonly items: readonly UploadItem[] }
  | { readonly type: "started"; readonly id: string }
  | { readonly type: "progressed"; readonly id: string; readonly percent: number }
  | { readonly type: "finished"; readonly id: string }
  | { readonly type: "failed"; readonly id: string; readonly errorTextId: UploadErrorTextId }
  | { readonly type: "familySwitched"; readonly errorTextId: UploadErrorTextId }
  | { readonly type: "clearedFinished" };

export type RunningUpload = {
  readonly id: string;
  readonly controller: AbortController;
};

export type RunningUploadRef = { current: RunningUpload | null };

export type UploadDispatch = Dispatch<UploadQueueAction>;

export type UploadQueue = {
  readonly items: readonly UploadItem[];
  readonly isIdle: boolean;
  readonly lastDone: UploadDone | null;
  readonly announcement: UploadAnnouncement | null;
  readonly enqueue: (files: readonly File[], target: UploadTarget) => void;
  readonly enqueueVersion: (file: File, target: VersionUploadTarget) => void;
  readonly clearFinished: () => void;
};

export type UploadQueueProviderProps = {
  readonly children: ReactNode;
};
